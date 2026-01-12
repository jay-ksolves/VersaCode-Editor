
import { useState, useEffect, useCallback } from 'react';
import { useOPFS } from './useOPFS';

export type FileSystemNode = {
  id: string;
  name: string;
  content: string;
  type: 'file';
  path: string;
  isDirty?: boolean;
} | {
  id:string;
  name: string;
  type: 'folder';
  children: FileSystemNode[];
  path: string;
};

export interface SearchResult {
    fileId: string;
    filePath: string;
    line: number;
    column: number;
    lineContent: string;
}

const UI_STATE_FILE_PATH = '.versacode/state.json';

interface UiState {
    openFileIds: string[];
    activeFileId: string | null;
    stagedFiles: string[];
    expandedFolders: string[];
}

export function useFileSystem() {
  const [files, setFiles] = useState<FileSystemNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [openFileIds, setOpenFileIds] = useState<string[]>([]);
  const [stagedFiles, setStagedFiles] = useState<Set<string>>(new Set());
  const { 
      isLoaded, 
      isLoading,
      readDirectory, 
      readFile, 
      writeFile, 
      createDirectory, 
      deleteFile, 
      deleteDirectory, 
      rename,
      importFromLocal,
      isDirtyMap,
      resetDirty,
      resetAll,
   } = useOPFS();

  const saveUiState = useCallback(async () => {
      try {
        const state: UiState = {
            openFileIds,
            activeFileId,
            stagedFiles: Array.from(stagedFiles),
            expandedFolders: Array.from(expandedFolders),
        };
        await writeFile(UI_STATE_FILE_PATH, JSON.stringify(state, null, 2));
      } catch (e) {
          console.error("Failed to save UI state to OPFS", e);
      }
  }, [activeFileId, expandedFolders, openFileIds, stagedFiles, writeFile]);

  const loadUiState = useCallback(async () => {
    try {
        const stateContent = await readFile(UI_STATE_FILE_PATH);
        const state: UiState = JSON.parse(stateContent);
        setOpenFileIds(state.openFileIds || []);
        setActiveFileId(state.activeFileId || null);
        setStagedFiles(new Set(state.stagedFiles || []));
        setExpandedFolders(new Set(state.expandedFolders || []));
    } catch (e) {
        // State file doesn't exist or is invalid, which is fine on first load.
    }
  }, [readFile]);
  
  const loadFileSystem = useCallback(async () => {
    if (!isLoaded) return;
    const tree = await readDirectory('');
    setFiles(tree);
    await loadUiState();
  }, [isLoaded, readDirectory, loadUiState]);

  useEffect(() => {
    loadFileSystem();
  }, [loadFileSystem]);

  useEffect(() => {
    if(isLoaded) {
      saveUiState();
    }
  }, [isLoaded, saveUiState, openFileIds, activeFileId, stagedFiles, expandedFolders]);
  
  const findNodeById = useCallback((id: string, searchInside: boolean = true): FileSystemNode | null => {
    const find = (nodes: FileSystemNode[]): FileSystemNode | null => {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.type === 'folder' && searchInside && node.children) {
            const found = find(node.children);
            if (found) return found;
            }
        }
        return null;
    }
    return find(files);
  }, [files]);

  const findNodeByPath = useCallback(async (path: string | null): Promise<FileSystemNode | null> => {
    if (!path) return null;
    const find = (nodes: FileSystemNode[]): FileSystemNode | null => {
        for (const node of nodes) {
            if (node.path === path) return node;
            if (node.type === 'folder' && node.children && path.startsWith(node.path + '/')) {
            const found = find(node.children);
            if (found) return found;
            }
        }
        return null;
    }
    return find(files);
  }, [files]);
  
  const getParentNode = useCallback((childId: string): FileSystemNode | null => {
      const findParent = (nodes: FileSystemNode[]): FileSystemNode | null => {
        for (const node of nodes) {
            if (node.type === 'folder' && node.children) {
                if (node.children.some(child => child.id === childId)) {
                    return node;
                }
                const found = findParent(node.children);
                if (found) return found;
            }
        }
        return null;
      }
      return findParent(files);
  }, [files]);

  const getTargetFolder = useCallback((selectedNodeId: string | null) => {
    if (!selectedNodeId) return null;
    const selectedNode = findNodeById(selectedNodeId);
    if (selectedNode?.type === 'folder') {
        return selectedNode;
    }
    return getParentNode(selectedNodeId);
  }, [findNodeById, getParentNode]);


  const activeFile = activeFileId ? findNodeById(activeFileId) : null;
  
  const readFileContent = useCallback(async (fileId: string): Promise<string> => {
      const node = findNodeById(fileId);
      if (node && node.type === 'file') {
          return await readFile(node.path);
      }
      return '';
  }, [findNodeById, readFile]);


  const updateFileContent = useCallback(async (id: string, content: string) => {
    const node = findNodeById(id);
    if (node?.type === 'file') {
        await writeFile(node.path, content);
        setFiles(prev => {
            const updateContent = (nodes: FileSystemNode[]): FileSystemNode[] => {
                return nodes.map(n => {
                    if (n.id === id) return { ...n, content, isDirty: isDirtyMap.get(node.path) };
                    if (n.type === 'folder' && n.children) return { ...n, children: updateContent(n.children) };
                    return n;
                });
            };
            return updateContent(prev);
        });
    }
  }, [findNodeById, writeFile, isDirtyMap]);

  const toggleFolder = useCallback((folderId: string, forceOpen = false) => {
    setExpandedFolders(prev => {
        const newSet = new Set(prev);
        if (forceOpen) {
            newSet.add(folderId);
        } else if (newSet.has(folderId)) {
            newSet.delete(folderId);
        } else {
            newSet.add(folderId);
        }
        return newSet;
    });
  }, []);

  const createFile = useCallback(async (name: string, parentId: string | null, content: string = '') => {
    const parentNode = parentId ? findNodeById(parentId) : null;
    const parentPath = parentNode?.path ?? '';
    const filePath = parentPath ? `${parentPath}/${name}` : name;
    
    try {
        await writeFile(filePath, content);
        await loadFileSystem();
        if (parentId) {
            toggleFolder(parentId, true);
        }
        
        const newNode = await findNodeByPath(filePath);
        return newNode?.id ?? null;

    } catch (error) {
        console.error(error);
        return null;
    }
  }, [findNodeById, writeFile, loadFileSystem, findNodeByPath, toggleFolder]);

  const createFolder = useCallback(async (name: string, parentId: string | null) => {
    const parentNode = parentId ? findNodeById(parentId) : null;
    const parentPath = parentNode?.path ?? '';
    const folderPath = parentPath ? `${parentPath}/${name}` : name;

    try {
        await createDirectory(folderPath);
        await loadFileSystem();
        if (parentId) {
            toggleFolder(parentId, true);
        }
    } catch(error) {
        console.error(error);
    }
  }, [findNodeById, createDirectory, loadFileSystem, toggleFolder]);

  const renameNode = useCallback(async (id: string, newName: string) => {
    const node = findNodeById(id);
    if (!node) return;
    
    try {
        await rename(node.path, newName);
        await loadFileSystem();
    } catch(error) {
        console.error(error);
    }
  }, [findNodeById, rename, loadFileSystem]);

  const closeFile = useCallback((fileId: string) => {
    setOpenFileIds(prev => {
        const newOpenFiles = prev.filter(id => id !== fileId);
        if (activeFileId === fileId) {
            const closingIndex = prev.indexOf(fileId);
            if (newOpenFiles.length > 0) {
                const newIndex = Math.max(0, closingIndex - 1);
                setActiveFileId(newOpenFiles[newIndex]);
            } else {
                setActiveFileId(null);
            }
        }
        return newOpenFiles;
    });
  }, [activeFileId]);

  const deleteNode = useCallback(async (id: string) => {
    const node = findNodeById(id);
    if (!node) return;
    
    const idsToClose = new Set<string>();
    const collectIds = (n: FileSystemNode) => {
        idsToClose.add(n.id);
        if (n.type === 'folder') n.children?.forEach(collectIds);
    };
    collectIds(node);

    try {
      if (node.type === 'file') {
        await deleteFile(node.path);
      } else {
        await deleteDirectory(node.path);
      }
      await loadFileSystem();

      setOpenFileIds(prevOpen => prevOpen.filter(openId => !idsToClose.has(openId)));
      if (idsToClose.has(activeFileId ?? '')) {
        const newOpenFiles = openFileIds.filter(openId => !idsToClose.has(openId));
        setActiveFileId(newOpenFiles[0] ?? null);
      }
       setStagedFiles(prev => {
        const newStaged = new Set(prev);
        idsToClose.forEach(id => newStaged.delete(id));
        return newStaged;
    });


    } catch (error) {
      console.error(error);
    }
  }, [findNodeById, deleteFile, deleteDirectory, loadFileSystem, activeFileId, openFileIds]);

  const moveNode = useCallback(async (draggedNodeId: string, dropTargetId: string | null) => {
    const draggedNode = findNodeById(draggedNodeId);
    if (!draggedNode) return;
    
    const dropTargetNode = dropTargetId ? findNodeById(dropTargetId) : null;
    if (dropTargetNode && dropTargetNode.type !== 'folder') return;

    let current = dropTargetNode;
    while(current) {
        if (current.id === draggedNodeId) {
            return;
        }
        current = getParentNode(current.id);
    }
    
    const newParentPath = dropTargetNode ? dropTargetNode.path : '';
    const newPath = newParentPath ? `${newParentPath}/${draggedNode.name}` : draggedNode.name;

    try {
        await rename(draggedNode.path, newPath);
        await loadFileSystem();
    } catch(e) {
        console.error("Move failed:", e);
    }
  }, [findNodeById, getParentNode, rename, loadFileSystem]);

  const openFile = useCallback(async (fileId: string) => {
    const node = findNodeById(fileId);
    if (node?.type === 'folder') {
        toggleFolder(fileId);
        return;
    }

    if (node?.type === 'file') {
        if (!openFileIds.includes(fileId)) {
            const content = await readFile(node.path);
            setFiles(prev => {
                 const updateContent = (nodes: FileSystemNode[]): FileSystemNode[] => {
                    return nodes.map(n => {
                        if (n.id === fileId) return { ...n, content };
                        if (n.type === 'folder') return { ...n, children: updateContent(n.children) };
                        return n;
                    });
                };
                return updateContent(prev);
            });
            setOpenFileIds(prev => [...prev, fileId]);
        }
        setActiveFileId(fileId);
    }
  }, [findNodeById, toggleFolder, openFileIds, readFile]);

  const searchFiles = useCallback((query: string): SearchResult[] => {
    const results: SearchResult[] = [];
    const lowerCaseQuery = query.toLowerCase();

    function searchInNodes(nodes: FileSystemNode[]) {
        for (const node of nodes) {
            if (node.type === 'file' && node.content) {
                const lines = node.content.split('\n');
                lines.forEach((lineContent, index) => {
                    const matchIndex = lineContent.toLowerCase().indexOf(lowerCaseQuery);
                    if (matchIndex !== -1) {
                        results.push({
                            fileId: node.id,
                            filePath: node.path,
                            line: index + 1,
                            column: matchIndex + 1,
                            lineContent: lineContent.trim(),
                        });
                    }
                });
            } else if (node.type === 'folder' && node.children) {
                searchInNodes(node.children);
            }
        }
    }
    searchInNodes(files);
    return results;
  }, [files]);
  
  const getAllFiles = useCallback((nodes: FileSystemNode[]): (FileSystemNode & {type: 'file'})[] => {
    let allFiles: (FileSystemNode & {type: 'file'})[] = [];
    for (const node of nodes) {
      if (node.type === 'file') {
        allFiles.push({ ...node, isDirty: isDirtyMap.get(node.path) });
      } else if (node.type === 'folder' && node.children) {
        allFiles = allFiles.concat(getAllFiles(node.children));
      }
    }
    return allFiles;
  }, [isDirtyMap]);

  // Git-like features
  const allProjectFiles = getAllFiles(files);
  const changedButNotStagedFiles = allProjectFiles.filter(file => file.isDirty && !stagedFiles.has(file.id));
  const stagedFileObjects = allProjectFiles.filter(file => stagedFiles.has(file.id));

  const stageFile = (fileId: string) => {
    setStagedFiles(prev => new Set(prev).add(fileId));
  };
  
  const unstageFile = (fileId: string) => {
    setStagedFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(fileId);
      return newSet;
    });
  };

  const commitChanges = (message: string) => {
    resetDirty(Array.from(stagedFiles).map(id => findNodeById(id)?.path).filter(Boolean) as string[]);
    setStagedFiles(new Set());
  };

  const handleImportFromLocal = async () => {
    await importFromLocal();
    await loadFileSystem();
  };

  return {
    files,
    setFiles,
    activeFileId,
    setActiveFileId,
    activeFile: activeFile?.type === 'file' ? activeFile as FileSystemNode & { type: 'file' } : null,
    updateFileContent,
    createFile,
    createFolder,
    renameNode,
    deleteNode,
    moveNode,
    getTargetFolder,
    expandedFolders,
    setExpandedFolders,
    toggleFolder,
    openFile,
    openFileIds,
    setOpenFileIds,
    closeFile,
    findNodeById,
    findNodeByPath,
    searchFiles,
    refreshFileSystem: loadFileSystem,
    changedFiles: changedButNotStagedFiles,
    stagedFiles: stagedFileObjects,
    stageFile,
    unstageFile,
    commitChanges,
    isLoaded,
    isLoading,
    importFromLocal: handleImportFromLocal,
    resetAll,
    readFileContent,
  };
}
