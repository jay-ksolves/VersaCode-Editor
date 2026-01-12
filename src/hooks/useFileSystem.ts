import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

export type FileSystemNode = {
  id: string;
  name: string;
  content: string;
  type: 'file';
} | {
  id: string;
  name: string;
  type: 'folder';
  children: FileSystemNode[];
};

const initialFileSystem: FileSystemNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    children: [
      { id: '2', name: 'app.tsx', type: 'file', content: 'console.log("Hello, World!");' },
      { id: '3', name: 'styles.css', type: 'file', content: 'body { margin: 0; }' },
    ],
  },
  { id: '4', name: 'package.json', type: 'file', content: '{ "name": "versacode-app" }' },
];

function findNodeById(nodes: FileSystemNode[], id: string): FileSystemNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.type === 'folder') {
      const found = findNodeById(node.children, id);
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

function updateNodeContentInTree(nodes: FileSystemNode[], id: string, content: string): FileSystemNode[] {
  return nodes.map(node => {
    if (node.id === id && node.type === 'file') {
      return { ...node, content };
    }
    if (node.type === 'folder') {
      return { ...node, children: updateNodeContentInTree(node.children, id, content) };
    }
    return node;
  });
}

function addNodeToTree(nodes: FileSystemNode[], parentId: string | null, newNode: FileSystemNode): FileSystemNode[] {
    if (!parentId) {
        return [...nodes, newNode];
    }

    return nodes.map(node => {
        if (node.id === parentId && node.type === 'folder') {
            return { ...node, children: [...node.children, newNode] };
        }
        if (node.type === 'folder') {
            return { ...node, children: addNodeToTree(node.children, parentId, newNode) };
        }
        return node;
    });
}

function renameNodeInTree(nodes: FileSystemNode[], id: string, newName: string): FileSystemNode[] {
    return nodes.map(node => {
        if (node.id === id) {
            return { ...node, name: newName };
        }
        if (node.type === 'folder') {
            return { ...node, children: renameNodeInTree(node.children, id, newName) };
        }
        return node;
    });
}

function deleteNodeFromTree(nodes: FileSystemNode[], id: string): FileSystemNode[] {
    return nodes.filter(node => node.id !== id).map(node => {
        if (node.type === 'folder') {
            return { ...node, children: deleteNodeFromTree(node.children, id) };
        }
        return node;
    });
}


const FS_LOCAL_STORAGE_KEY = 'versacode_filesystem';
const EXPANDED_FOLDERS_LOCAL_STORAGE_KEY = 'versacode_expanded_folders';


export function useFileSystem() {
  const [files, setFiles] = useState<FileSystemNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1']));
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedFiles = localStorage.getItem(FS_LOCAL_STORAGE_KEY);
      const storedExpanded = localStorage.getItem(EXPANDED_FOLDERS_LOCAL_STORAGE_KEY);

      if (storedFiles) {
        setFiles(JSON.parse(storedFiles));
      } else {
        setFiles(initialFileSystem);
      }

      if (storedExpanded) {
        setExpandedFolders(new Set(JSON.parse(storedExpanded)));
      } else {
        setExpandedFolders(new Set(['1'])); // Default to expanding 'src'
      }

    } catch (error) {
      console.error("Failed to parse from localStorage", error);
      setFiles(initialFileSystem);
      setExpandedFolders(new Set(['1']));
    }
  }, []);

  useEffect(() => {
    if (files.length > 0) {
        try {
            localStorage.setItem(FS_LOCAL_STORAGE_KEY, JSON.stringify(files));
            localStorage.setItem(EXPANDED_FOLDERS_LOCAL_STORAGE_KEY, JSON.stringify(Array.from(expandedFolders)));
        } catch (error) {
            console.error("Failed to save to localStorage", error);
        }
    }
  }, [files, expandedFolders]);

  const activeFile = activeFileId ? findNodeById(files, activeFileId) : null;

  const updateFileContent = useCallback((id: string, content: string) => {
    setFiles(prevFiles => updateNodeContentInTree(prevFiles, id, content));
  }, []);
  
  const getTargetFolder = useCallback((selectedNodeId: string | null) => {
    if (!selectedNodeId) return null;
    const selectedNode = findNodeById(files, selectedNodeId);
    if (selectedNode?.type === 'folder') {
        return selectedNode;
    }
    return findParentNode(files, selectedNodeId);
  }, [files]);

  const validateName = (name: string, parentId: string | null) => {
    if (!name) return "Name cannot be empty.";
    if (name.includes('/') || name.includes('\\')) return "Name cannot contain slashes.";
    
    let siblingNodes: FileSystemNode[] = [];
    if (parentId) {
        const parentNode = findNodeById(files, parentId);
        if (parentNode && parentNode.type === 'folder') {
            siblingNodes = parentNode.children;
        }
    } else {
        siblingNodes = files;
    }
    if (siblingNodes.some(node => node.name === name)) {
        return "A file or folder with this name already exists in this directory.";
    }
    return null;
  }

  const createFile = useCallback((name: string, parentId: string | null) => {
    const validationError = validateName(name, parentId);
    if (validationError) {
        toast({ variant: 'destructive', title: "Invalid Name", description: validationError });
        return;
    }
    const newFile: FileSystemNode = {
        id: Date.now().toString(),
        name,
        type: 'file',
        content: `// ${name}\n`,
    };
    setFiles(prevFiles => addNodeToTree(prevFiles, parentId, newFile));
    if (parentId) setExpandedFolders(prev => new Set(prev).add(parentId));
    toast({ title: "File Created", description: `${name} was added.` });
  }, [files, toast]);

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
    };
    setFiles(prevFiles => addNodeToTree(prevFiles, parentId, newFolder));
    if (parentId) setExpandedFolders(prev => new Set(prev).add(parentId));
    toast({ title: "Folder Created", description: `${name} was added.` });
  }, [files, toast]);

  const renameNode = useCallback((id: string, newName: string) => {
    const node = findNodeById(files, id);
    if (!node) return;
    const parent = findParentNode(files, id);
    const parentId = parent ? parent.id : null;

    const validationError = validateName(newName, parentId);
    if (validationError) {
        toast({ variant: 'destructive', title: "Invalid Name", description: validationError });
        return;
    }
    
    setFiles(prevFiles => renameNodeInTree(prevFiles, id, newName));
    toast({ title: "Renamed", description: `Renamed to ${newName}.` });
  }, [files, toast]);

  const deleteNode = useCallback((id: string) => {
    const nodeToDelete = findNodeById(files, id);
    if (!nodeToDelete) return;
    
    setFiles(prevFiles => deleteNodeFromTree(prevFiles, id));
    if (activeFileId === id) {
        setActiveFileId(null);
    }
    toast({ title: "Deleted", description: `${nodeToDelete.name} was deleted.` });
  }, [files, toast, activeFileId]);

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
        const newSet = new Set(prev);
        if (newSet.has(folderId)) {
            newSet.delete(folderId);
        } else {
            newSet.add(folderId);
        }
        return newSet;
    });
  }, []);


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
    getTargetFolder,
    expandedFolders,
    toggleFolder
  };
}
