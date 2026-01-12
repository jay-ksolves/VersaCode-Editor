
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
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

const OPEN_FILES_LOCAL_STORAGE_KEY = 'versacode_opfs_open_files';
const ACTIVE_FILE_LOCAL_STORAGE_KEY = 'versacode_opfs_active_file';
const STAGED_FILES_LOCAL_STORAGE_KEY = 'versacode_opfs_staged_files';
const EXPANDED_FOLDERS_LOCAL_STORAGE_KEY = 'versacode_opfs_expanded_folders';


export function useFileSystem() {
  const [files, setFiles] = useState<FileSystemNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [openFileIds, setOpenFileIds] = useState<string[]>([]);
  const [stagedFiles, setStagedFiles] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { 
      isLoaded, 
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
  
  const loadFileSystem = useCallback(async () => {
    if (!isLoaded) return;
    const tree = await readDirectory('');
    setFiles(tree);

     try {
      const storedExpanded = localStorage.getItem(EXPANDED_FOLDERS_LOCAL_STORAGE_KEY);
      const storedOpenFiles = localStorage.getItem(OPEN_FILES_LOCAL_STORAGE_KEY);
      const storedActiveFile = localStorage.getItem(ACTIVE_FILE_LOCAL_STORAGE_KEY);
      const storedStagedFiles = localStorage.getItem(STAGED_FILES_LOCAL_STORAGE_KEY);
      
      if (storedExpanded) setExpandedFolders(new Set(JSON.parse(storedExpanded)));
      if (storedStagedFiles) setStagedFiles(new Set(JSON.parse(storedStagedFiles)));

      if (storedOpenFiles) {
        const parsedOpenFiles = JSON.parse(storedOpenFiles);
        setOpenFileIds(parsedOpenFiles);

        if (storedActiveFile && parsedOpenFiles.includes(storedActiveFile)) {
            setActiveFileId(storedActiveFile);
        } else if (parsedOpenFiles.length > 0) {
            setActiveFileId(parsedOpenFiles[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load UI state from local storage", e);
    }

  }, [isLoaded, readDirectory]);

  useEffect(() => {
    loadFileSystem();
  }, [loadFileSystem]);

  const saveUIState = useCallback(() => {
    localStorage.setItem(EXPANDED_FOLDERS_LOCAL_STORAGE_KEY, JSON.stringify(Array.from(expandedFolders)));
    localStorage.setItem(OPEN_FILES_LOCAL_STORAGE_KEY, JSON.stringify(openFileIds));
    localStorage.setItem(STAGED_FILES_LOCAL_STORAGE_KEY, JSON.stringify(Array.from(stagedFiles)));
    if (activeFileId) {
      localStorage.setItem(ACTIVE_FILE_LOCAL_STORAGE_KEY, activeFileId);
    } else {
      localStorage.removeItem(ACTIVE_FILE_LOCAL_STORAGE_KEY);
    }
  }, [expandedFolders, openFileIds, stagedFiles, activeFileId]);

  useEffect(() => {
    if(isLoaded) {
      saveUIState();
    }
  }, [isLoaded, saveUIState]);
  
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

  const updateFileContent = useCallback(async (id: string, content: string) => {
    const node = findNodeById(id);
    if (node?.type === 'file' && node.content !== content) {
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


  const createFile = useCallback(async (name: string, parentId: string | null, content: string = '') => {
    const parentNode = parentId ? findNodeById(parentId) : null;
    const parentPath = parentNode?.path ?? '';
    const filePath = parentPath ? `${parentPath}/${name}` : name;
    
    try {
        await writeFile(filePath, content);
        await loadFileSystem();
        if (parentId) {
            setExpandedFolders(prev => new Set(prev).add(parentId!));
        }
        toast({ title: "File Created", description: `${name} was added.` });
        
        const newNode = await findNodeByPath(filePath);
        return newNode?.id ?? null;

    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: "Error creating file", description: String(error) });
        return null;
    }
  }, [findNodeById, writeFile, loadFileSystem, toast, findNodeByPath]);

  const createFolder = useCallback(async (name: string, parentId: string | null) => {
    const parentNode = parentId ? findNodeById(parentId) : null;
    const parentPath = parentNode?.path ?? '';
    const folderPath = parentPath ? `${parentPath}/${name}` : name;

    try {
        await createDirectory(folderPath);
        await loadFileSystem();
        if (parentId) {
            setExpandedFolders(prev => new Set(prev).add(parentId!));
        }
        toast({ title: "Folder Created", description: `${name} was added.` });
    } catch(error) {
        console.error(error);
        toast({ variant: 'destructive', title: "Error creating folder", description: String(error) });
    }
  }, [findNodeById, createDirectory, loadFileSystem, toast]);

  const renameNode = useCallback(async (id: string, newName: string) => {
    const node = findNodeById(id);
    if (!node) return;
    
    try {
        await rename(node.path, newName);
        await loadFileSystem();
        toast({ title: "Renamed", description: `Renamed to ${newName}.` });
    } catch(error) {
        console.error(error);
        toast({ variant: 'destructive', title: "Error renaming", description: String(error) });
    }
  }, [findNodeById, rename, loadFileSystem, toast]);

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

      toast({ title: "Deleted", description: `${node.name} was deleted.` });

    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: "Error deleting", description: String(error) });
    }
  }, [findNodeById, deleteFile, deleteDirectory, toast, loadFileSystem, activeFileId, openFileIds]);

  const moveNode = useCallback(async (draggedNodeId: string, dropTargetId: string | null) => {
    const draggedNode = findNodeById(draggedNodeId);
    if (!draggedNode) return;
    
    const dropTargetNode = dropTargetId ? findNodeById(dropTargetId) : null;
    if (dropTargetNode && dropTargetNode.type !== 'folder') return;

    let current = dropTargetNode;
    while(current) {
        if (current.id === draggedNodeId) {
            toast({ variant: 'destructive', title: "Invalid Move", description: "Cannot move a folder into itself."});
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
        toast({variant: 'destructive', title: 'Move Failed', description: String(e) });
    }
  }, [findNodeById, getParentNode, rename, loadFileSystem, toast]);

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
    importFromLocal: handleImportFromLocal,
    resetAll,
  };
}
