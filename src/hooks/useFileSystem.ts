
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";

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

const initialFileSystem: FileSystemNode[] = [];

function findNodeById(nodes: FileSystemNode[], id: string, searchInside: boolean = true): FileSystemNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.type === 'folder' && searchInside) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function findNodeByPath(nodes: FileSystemNode[], path: string | null): FileSystemNode | null {
  if (!path) return null;
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.type === 'folder' && path.startsWith(node.path + '/')) {
      const found = findNodeByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

function findParentNode(nodes: FileSystemNode[], childId: string): FileSystemNode | null {
    for (const node of nodes) {
        if (node.type === 'folder') {
            if (node.children.some(child => child.id === childId)) {
                return node;
            }
            const foundParent = findParentNode(node.children, childId);
            if (foundParent) {
                return foundParent;
            }
        }
    }
    return null;
}

function updateNodeInTree(nodes: FileSystemNode[], id: string, updates: Partial<FileSystemNode>): FileSystemNode[] {
    return nodes.map(node => {
        if (node.id === id) {
            return { ...node, ...updates };
        }
        if (node.type === 'folder') {
            return { ...node, children: updateNodeInTree(node.children, id, updates) };
        }
        return node;
    });
}

function updatePaths(nodes: FileSystemNode[], parentPath = ''): FileSystemNode[] {
    return nodes.map(node => {
        const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
        const updatedNode = { ...node, path: currentPath };
        if (updatedNode.type === 'folder') {
            updatedNode.children = updatePaths(updatedNode.children, currentPath);
        }
        return updatedNode;
    });
}

function removeNodeFromTree(nodes: FileSystemNode[], id: string): { tree: FileSystemNode[], removedNode: FileSystemNode | null } {
    let removedNode: FileSystemNode | null = null;
    
    const findAndRemove = (nodes: FileSystemNode[]): FileSystemNode[] => {
        return nodes.filter(node => {
            if (node.id === id) {
                removedNode = node;
                return false;
            }
            if (node.type === 'folder') {
                const { tree: newChildren, removedNode: childRemoved } = removeNodeFromTree(node.children, id);
                if (childRemoved) removedNode = childRemoved;
                node.children = newChildren;
            }
            return true;
        });
    }
    
    const tree = findAndRemove(nodes);
    return { tree, removedNode };
}

function addNodeToTree(nodes: FileSystemNode[], parentId: string | null, newNode: FileSystemNode): FileSystemNode[] {
    if (!parentId) {
        return updatePaths([...nodes, newNode]);
    }

    const tree = nodes.map(node => {
        if (node.id === parentId && node.type === 'folder') {
            return { ...node, children: [...node.children, newNode] };
        }
        if (node.type === 'folder') {
            return { ...node, children: addNodeToTree(node.children, parentId, newNode) };
        }
        return node;
    });
    return updatePaths(tree);
}

function renameNodeInTree(nodes: FileSystemNode[], id: string, newName: string): FileSystemNode[] {
    return updatePaths(nodes.map(node => {
        if (node.id === id) {
            return { ...node, name: newName };
        }
        if (node.type === 'folder') {
            return { ...node, children: renameNodeInTree(node.children, id, newName) };
        }
        return node;
    }));
}


const FS_LOCAL_STORAGE_KEY = 'versacode_filesystem';
const EXPANDED_FOLDERS_LOCAL_STORAGE_KEY = 'versacode_expanded_folders';
const OPEN_FILES_LOCAL_STORAGE_KEY = 'versacode_open_files';
const ACTIVE_FILE_LOCAL_STORAGE_KEY = 'versacode_active_file';

export function useFileSystem({ autoSave }: { autoSave: boolean }) {
  const [files, setFiles] = useState<FileSystemNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1']));
  const [openFileIds, setOpenFileIds] = useState<string[]>([]);
  const { toast } = useToast();

  const loadFromLocalStorage = useCallback(() => {
    try {
      const storedFiles = localStorage.getItem(FS_LOCAL_STORAGE_KEY);
      const storedExpanded = localStorage.getItem(EXPANDED_FOLDERS_LOCAL_STORAGE_KEY);
      const storedOpenFiles = localStorage.getItem(OPEN_FILES_LOCAL_STORAGE_KEY);
      const storedActiveFile = localStorage.getItem(ACTIVE_FILE_LOCAL_STORAGE_KEY);

      const parsedFiles = storedFiles ? JSON.parse(storedFiles) : initialFileSystem;
      setFiles(parsedFiles);

      if (storedExpanded) {
        setExpandedFolders(new Set(JSON.parse(storedExpanded)));
      } else {
        setExpandedFolders(new Set(['1']));
      }

      if (storedOpenFiles) {
        const parsedOpenFiles = JSON.parse(storedOpenFiles);
        setOpenFileIds(parsedOpenFiles);

        if (storedActiveFile && parsedOpenFiles.includes(storedActiveFile)) {
            setActiveFileId(storedActiveFile);
        } else if (parsedOpenFiles.length > 0) {
            setActiveFileId(parsedOpenFiles[0]);
        }
      }

    } catch (error) {
      console.error("Failed to parse from localStorage", error);
      setFiles(initialFileSystem);
      setExpandedFolders(new Set(['1']));
    }
  }, []);
  
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  const saveToLocalStorage = useCallback(() => {
    try {
      localStorage.setItem(FS_LOCAL_STORAGE_KEY, JSON.stringify(files));
      localStorage.setItem(EXPANDED_FOLDERS_LOCAL_STORAGE_KEY, JSON.stringify(Array.from(expandedFolders)));
      localStorage.setItem(OPEN_FILES_LOCAL_STORAGE_KEY, JSON.stringify(openFileIds));
      if (activeFileId) {
          localStorage.setItem(ACTIVE_FILE_LOCAL_STORAGE_KEY, activeFileId);
      } else {
          localStorage.removeItem(ACTIVE_FILE_LOCAL_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save to localStorage", error);
    }
  }, [files, expandedFolders, openFileIds, activeFileId]);

  useEffect(() => {
    if (autoSave) {
        saveToLocalStorage();
    }
  }, [files, expandedFolders, openFileIds, activeFileId, autoSave, saveToLocalStorage]);

  const activeFile = activeFileId ? findNodeById(files, activeFileId) : null;

  const updateFileContent = useCallback((id: string, content: string) => {
    setFiles(prevFiles => {
        const node = findNodeById(prevFiles, id);
        if (node?.type === 'file' && node.content !== content) {
            return updateNodeInTree(prevFiles, id, { content, isDirty: true });
        }
        return prevFiles;
    });
  }, []);
  
  const getTargetFolder = useCallback((selectedNodeId: string | null) => {
    if (!selectedNodeId) return null;
    const selectedNode = findNodeById(files, selectedNodeId);
    if (selectedNode?.type === 'folder') {
        return selectedNode;
    }
    return findParentNode(files, selectedNodeId);
  }, [files]);

  const validateName = (name: string, parentId: string | null, nodeIdToIgnore: string | null = null) => {
    if (!name) return "Name cannot be empty.";
    if (name.includes('/') || name.includes('\\')) return "Name cannot contain slashes.";
    
    let siblingNodes: FileSystemNode[] = [];
    const parentNode = parentId ? findNodeById(files, parentId) : null;

    if (parentNode && parentNode.type === 'folder') {
        siblingNodes = parentNode.children;
    } else if (!parentId) {
        siblingNodes = files;
    }
    
    if (siblingNodes.some(node => node.name === name && node.id !== nodeIdToIgnore)) {
        return "A file or folder with this name already exists in this directory.";
    }
    return null;
  }

  const createFile = useCallback((name: string, parentId: string | null, content: string = '') => {
    const validationError = validateName(name, parentId);
    if (validationError) {
        toast({ variant: 'destructive', title: "Invalid Name", description: validationError });
        return null;
    }
    const newFile: FileSystemNode = {
        id: Date.now().toString(),
        name,
        type: 'file',
        content: content || `// ${name}\n`,
        path: '', 
        isDirty: false,
    };
    setFiles(prevFiles => addNodeToTree(prevFiles, parentId, newFile));
    if (parentId) setExpandedFolders(prev => new Set(prev).add(parentId));
    toast({ title: "File Created", description: `${name} was added.` });
    return newFile.id;
  }, [toast]);

  const createFolder = useCallback((name: string, parentId: string | null) => {
    const validationError = validateName(name, parentId);
    if (validationError) {
        toast({ variant: 'destructive', title: "Invalid Name", description: validationError });
        return;
    }
    const newFolder: FileSystemNode = {
        id: Date.now().toString(),
        name,
        type: 'folder',
        children: [],
        path: '',
    };
    setFiles(prevFiles => addNodeToTree(prevFiles, parentId, newFolder));
    if (parentId) setExpandedFolders(prev => new Set(prev).add(parentId));
    toast({ title: "Folder Created", description: `${name} was added.` });
  }, [toast]);

  const renameNode = useCallback((id: string, newName: string) => {
    const node = findNodeById(files, id);
    if (!node) return;
    const parent = findParentNode(files, id);
    const parentId = parent ? parent.id : null;

    const validationError = validateName(newName, parentId, id);
    if (validationError) {
        toast({ variant: 'destructive', title: "Invalid Name", description: validationError });
        return;
    }
    
    setFiles(prevFiles => renameNodeInTree(prevFiles, id, newName));
    toast({ title: "Renamed", description: `Renamed to ${newName}.` });
  }, [files, toast]);

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


  const deleteNode = useCallback((id: string) => {
    let nodeToDelete: FileSystemNode | null = null;
    setFiles(prevFiles => {
      const { tree, removedNode } = removeNodeFromTree(prevFiles, id);
      nodeToDelete = removedNode;
      return tree;
    });

    if (!nodeToDelete) return;
    
    const idsToClose = new Set<string>();
    function findIds(node: FileSystemNode) {
        if (node.type === 'file') {
            idsToClose.add(node.id);
        } else if (node.type === 'folder') {
            node.children.forEach(findIds);
        }
    }
    findIds(nodeToDelete);

    setOpenFileIds(prevOpen => {
      const newOpenFiles = prevOpen.filter(openId => !idsToClose.has(openId));
      if (idsToClose.has(activeFileId ?? '')) {
        setActiveFileId(newOpenFiles[0] ?? null);
      }
      return newOpenFiles;
    });
    
    toast({ title: "Deleted", description: `${nodeToDelete.name} was deleted.` });
  }, [toast, activeFileId]);

  const moveNode = useCallback((draggedNodeId: string, dropTargetId: string | null) => {
    const draggedNode = findNodeById(files, draggedNodeId);
    if (!draggedNode) return;

    if (dropTargetId) {
        const dropTargetNode = findNodeById(files, dropTargetId);
        if (!dropTargetNode || dropTargetNode.type !== 'folder') return;
        
        let current = dropTargetNode;
        while(current) {
            if (current.id === draggedNodeId) {
                toast({ variant: 'destructive', title: "Invalid Move", description: "Cannot move a folder into itself."});
                return;
            }
            const parent = findParentNode(files, current.id);
            current = parent!;
        }
    }
    
    let movedNode: FileSystemNode | null = null;

    setFiles(currentFiles => {
        const { tree, removedNode } = removeNodeFromTree(currentFiles, draggedNodeId);
        movedNode = removedNode;
        let newFiles = tree;

        if (movedNode) {
            newFiles = addNodeToTree(newFiles, dropTargetId, movedNode);
        }
        return newFiles;
    });
    
  }, [files, toast]);

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

  const openFile = useCallback((fileId: string) => {
    const node = findNodeById(files, fileId);
    if (node?.type === 'folder') {
        toggleFolder(fileId);
        return;
    }

    if (node?.type === 'file') {
        if (!openFileIds.includes(fileId)) {
            setOpenFileIds(prev => [...prev, fileId]);
        }
        setActiveFileId(fileId);
    }
  }, [files, openFileIds, toggleFolder]);

  const searchFiles = useCallback((query: string): SearchResult[] => {
    const results: SearchResult[] = [];
    const lowerCaseQuery = query.toLowerCase();

    function searchInNodes(nodes: FileSystemNode[]) {
        for (const node of nodes) {
            if (node.type === 'file') {
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
            } else if (node.type === 'folder') {
                searchInNodes(node.children);
            }
        }
    }
    searchInNodes(files);
    return results;
  }, [files]);


  return {
    files,
    setFiles,
    activeFileId,
    setActiveFileId,
    activeFile: activeFile?.type === 'file' ? activeFile : null,
    updateFileContent,
    createFile,
    createFolder,
    renameNode,
    deleteNode,
    moveNode,
    getTargetFolder,
    expandedFolders,
    toggleFolder,
    openFile,
    openFileIds,
    setOpenFileIds,
    closeFile,
    findNodeById,
    findNodeByPath,
    searchFiles,
    refreshFileSystem: loadFromLocalStorage,
  };
}
