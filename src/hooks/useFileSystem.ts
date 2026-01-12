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


const LOCAL_STORAGE_KEY = 'versacode_filesystem';

export function useFileSystem() {
  const [files, setFiles] = useState<FileSystemNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedFiles = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedFiles) {
        setFiles(JSON.parse(storedFiles));
      } else {
        setFiles(initialFileSystem);
      }
    } catch (error) {
      console.error("Failed to parse filesystem from localStorage", error);
      setFiles(initialFileSystem);
    }
  }, []);

  useEffect(() => {
    if (files.length > 0) {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(files));
        } catch (error) {
            console.error("Failed to save filesystem to localStorage", error);
        }
    }
  }, [files]);

  const activeFile = activeFileId ? findNodeById(files, activeFileId) : null;

  const updateFileContent = useCallback((id: string, content: string) => {
    setFiles(prevFiles => updateNodeContentInTree(prevFiles, id, content));
  }, []);
  
  const getParentOfActive = () => {
    if (!activeFileId) return null;

    function findParent(nodes: FileSystemNode[], childId: string): FileSystemNode | null {
        for (const node of nodes) {
            if (node.type === 'folder') {
                if (node.children.some(child => child.id === childId)) {
                    return node;
                }
                const parent = findParent(node.children, childId);
                if (parent) return parent;
            }
        }
        return null;
    }
    return findParent(files, activeFileId);
  }

  const createFile = useCallback(() => {
    const parentNode = activeFile?.type === 'folder' ? activeFile : getParentOfActive();
    const parentId = parentNode ? parentNode.id : null;
    const fileName = prompt("Enter file name:", "new-file.ts");
    
    if (fileName) {
        const newFile: FileSystemNode = {
            id: Date.now().toString(),
            name: fileName,
            type: 'file',
            content: `// ${fileName}\n`,
        };
        setFiles(prevFiles => addNodeToTree(prevFiles, parentId, newFile));
        toast({ title: "File Created", description: `${fileName} was added.` });
    }
  }, [activeFile, files, toast]);

  const createFolder = useCallback(() => {
    const parentNode = activeFile?.type === 'folder' ? activeFile : getParentOfActive();
    const parentId = parentNode ? parentNode.id : null;

    const folderName = prompt("Enter folder name:", "new-folder");
    if (folderName) {
        const newFolder: FileSystemNode = {
            id: Date.now().toString(),
            name: folderName,
            type: 'folder',
            children: [],
        };
        setFiles(prevFiles => addNodeToTree(prevFiles, parentId, newFolder));
        toast({ title: "Folder Created", description: `${folderName} was added.` });
    }
  }, [activeFile, files, toast]);


  return {
    files,
    setFiles,
    activeFileId,
    setActiveFileId,
    activeFile: activeFile?.type === 'file' ? activeFile : null,
    updateFileContent,
    createFile,
    createFolder
  };
}
