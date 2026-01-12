
'use client';

import { useState, useEffect, useCallback } from 'react';

// Debounce saving dirty map to avoid excessive localStorage writes
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
    let timeout: ReturnType<typeof setTimeout>;
    return function (this: any, ...args: Parameters<T>) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    } as T;
}


const DIRTY_MAP_STORAGE_KEY = 'versacode_opfs_dirty_map';

export function useOPFS() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isDirtyMap, setIsDirtyMap] = useState<Map<string, boolean>>(new Map());
    const [rootHandle, setRootHandle] = useState<FileSystemDirectoryHandle | null>(null);

    const saveDirtyMap = useCallback(debounce((map: Map<string, boolean>) => {
        try {
            const serializable = Array.from(map.entries());
            localStorage.setItem(DIRTY_MAP_STORAGE_KEY, JSON.stringify(serializable));
        } catch (e) {
            console.error("Failed to save dirty map to localStorage", e);
        }
    }, 500), []);
    
    const setDirty = useCallback((path: string) => {
        setIsDirtyMap(prev => {
            const newMap = new Map(prev);
            newMap.set(path, true);
            saveDirtyMap(newMap);
            return newMap;
        });
    }, [saveDirtyMap]);

    const resetDirty = useCallback((paths: string[]) => {
        setIsDirtyMap(prev => {
            const newMap = new Map(prev);
            paths.forEach(p => newMap.delete(p));
            saveDirtyMap(newMap);
            return newMap;
        });
    }, [saveDirtyMap]);

    useEffect(() => {
        async function init() {
            try {
                const root = await navigator.storage.getDirectory();
                setRootHandle(root);

                const storedDirty = localStorage.getItem(DIRTY_MAP_STORAGE_KEY);
                if (storedDirty) {
                    setIsDirtyMap(new Map(JSON.parse(storedDirty)));
                }

                // Check if the file system is empty, if so, add a welcome file.
                let hasEntries = false;
                for await (const _ of root.keys()) {
                    hasEntries = true;
                    break;
                }
                if (!hasEntries) {
                    const welcomeContent = `
# Welcome to VersaCode!

This is a sample markdown file in your personal, browser-based file system.

## Features

- **File Explorer**: Create, rename, delete, and organize files and folders.
- **Code Editor**: A full-featured editor powered by Monaco (the same editor as VS Code).
- **AI Assistant**: Use the bot icon to get help with your code.
- **Persistence**: Your files are saved in your browser's Origin Private File System, so they persist between sessions.

Enjoy coding!
`;
                    const fileHandle = await root.getFileHandle('welcome.md', { create: true });
                    const writable = await fileHandle.createWritable();
                    await writable.write(welcomeContent);
                    await writable.close();
                }

            } catch (e) {
                console.error("OPFS not supported or initialization failed.", e);
            } finally {
                setIsLoaded(true);
            }
        }
        init();
    }, []);

    const getHandle = useCallback(async (path: string, create: boolean = false, type: 'file' | 'directory' = 'file') => {
        if (!rootHandle) throw new Error("File system not initialized");
        const parts = path.split('/').filter(p => p);
        let currentHandle: FileSystemDirectoryHandle = rootHandle;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLast = i === parts.length - 1;
            
            if (isLast && type === 'file') {
                return await currentHandle.getFileHandle(part, { create });
            } else {
                currentHandle = await currentHandle.getDirectoryHandle(part, { create });
            }
        }
        return currentHandle;
    }, [rootHandle]);

    const readDirectory = useCallback(async (path: string): Promise<any[]> => {
        const dirHandle = path ? await getHandle(path, false, 'directory') as FileSystemDirectoryHandle : rootHandle;
        if (!dirHandle) return [];

        const entries = [];
        for await (const [name, handle] of dirHandle.entries()) {
            const entryPath = path ? `${path}/${name}` : name;
            if (handle.kind === 'directory') {
                entries.push({
                    id: entryPath,
                    name,
                    type: 'folder',
                    path: entryPath,
                    children: await readDirectory(entryPath),
                });
            } else {
                entries.push({
                    id: entryPath,
                    name,
                    type: 'file',
                    path: entryPath,
                    content: '', // Content is loaded on demand
                    isDirty: isDirtyMap.get(entryPath),
                });
            }
        }
        return entries.sort((a,b) => {
            if (a.type === 'folder' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });
    }, [getHandle, isDirtyMap, rootHandle]);
    
    const readFile = useCallback(async (path: string): Promise<string> => {
        const fileHandle = await getHandle(path, false, 'file') as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        return await file.text();
    }, [getHandle]);

    const writeFile = useCallback(async (path: string, content: string): Promise<void> => {
        const fileHandle = await getHandle(path, true, 'file') as FileSystemFileHandle;
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        setDirty(path);
    }, [getHandle, setDirty]);

    const createDirectory = useCallback(async (path: string): Promise<void> => {
        await getHandle(path, true, 'directory');
    }, [getHandle]);
    
    const deleteFile = useCallback(async (path: string): Promise<void> => {
        const parts = path.split('/');
        const name = parts.pop()!;
        const parentPath = parts.join('/');
        const dirHandle = parentPath ? await getHandle(parentPath, false, 'directory') as FileSystemDirectoryHandle : rootHandle;
        if (dirHandle) {
           await dirHandle.removeEntry(name);
        }
    }, [getHandle, rootHandle]);

    const deleteDirectory = useCallback(async (path: string): Promise<void> => {
        const parts = path.split('/');
        const name = parts.pop()!;
        const parentPath = parts.join('/');
        const dirHandle = parentPath ? await getHandle(parentPath, false, 'directory') as FileSystemDirectoryHandle : rootHandle;
        if (dirHandle) {
           await dirHandle.removeEntry(name, { recursive: true });
        }
    }, [getHandle, rootHandle]);

    const rename = useCallback(async (oldPath: string, newPathOrName: string): Promise<void> => {
        // This is a simplified rename. In a real OPFS scenario, this would involve moving files.
        // For this simulation, we'll read, write to new, and delete old.
        const handle = await getHandle(oldPath, false, oldPath.includes('.') ? 'file' : 'directory');
        let newPath = newPathOrName;

        if (!newPathOrName.includes('/')) {
             const parts = oldPath.split('/');
             parts.pop();
             newPath = parts.length > 0 ? `${parts.join('/')}/${newPathOrName}` : newPathOrName;
        }

        if (handle.kind === 'file') {
            const content = await readFile(oldPath);
            await writeFile(newPath, content);
            await deleteFile(oldPath);
        } else {
            await createDirectory(newPath);
            const children = await readDirectory(oldPath);
            for (const child of children) {
                await rename(child.path, `${newPath}/${child.name}`);
            }
            await deleteDirectory(oldPath);
        }

    }, [getHandle, readFile, writeFile, deleteFile, createDirectory, readDirectory, deleteDirectory]);

     const importFromLocal = async () => {
        if (!window.showDirectoryPicker) {
            alert("Your browser does not support the File System Access API.");
            return;
        }
        
        const localDirHandle = await window.showDirectoryPicker();
        if (!rootHandle) return;
        
        await resetAll();

        async function copy(local: FileSystemDirectoryHandle | FileSystemFileHandle, remotePath: string) {
             if (local.kind === 'file') {
                const file = await local.getFile();
                const content = await file.text();
                const newFilePath = remotePath ? `${remotePath}/${local.name}` : local.name;
                await writeFile(newFilePath, content);
             } else if (local.kind === 'directory') {
                const newRemotePath = remotePath ? `${remotePath}/${local.name}` : local.name;
                await createDirectory(newRemotePath);
                for await (const handle of local.values()) {
                    await copy(handle, newRemotePath);
                }
             }
        }

         for await (const handle of localDirHandle.values()) {
            await copy(handle, '');
        }
    };

    const resetAll = async () => {
        if (!rootHandle) return;
        for await (const name of rootHandle.keys()) {
            const handle = await rootHandle.getDirectoryHandle(name).catch(() => rootHandle!.getFileHandle(name));
            if (handle.kind === 'directory') {
                await rootHandle.removeEntry(name, { recursive: true });
            } else {
                await rootHandle.removeEntry(name);
            }
        }
        setIsDirtyMap(new Map());
        saveDirtyMap(new Map());
    };


    return { isLoaded, readDirectory, readFile, writeFile, createDirectory, deleteFile, deleteDirectory, rename, importFromLocal, isDirtyMap, resetDirty, resetAll };
}
