
"use client";

import { Folder, File as FileIcon, ChevronRight, FolderPlus, FilePlus, MoreVertical, Edit, Trash2, Wand2, FolderOpen, FileJson, FileCode, FileText, RefreshCw, ChevronDown } from "lucide-react";
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";
import type { FileSystemNode } from "@/hooks/useFileSystem";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { generateCodeFromPrompt } from "@/ai/flows/generate-code-from-prompt";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "../ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { ScrollArea } from "../ui/scroll-area";

type Operation = 'create_file' | 'create_folder' | 'rename';
type EditState = {
  id: string;
  type: Operation;
  parentId: string | null;
  onDone: (value: string) => void;
  onCancel: () => void;
} | null;

type DeleteOperation = { type: 'delete', nodeId: string, nodeName: string } | null;
type GenerateOperation = { type: 'generate_code', parentId: string | null } | null;

export const FileIconComponent = ({ filename }: { filename: string }) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'json':
            return <FileJson className="w-4 h-4 text-yellow-500" />;
        case 'css':
        case 'tailwind':
            return <FileCode className="w-4 h-4 text-blue-500" />;
        case 'tsx':
        case 'jsx':
            return <FileCode className="w-4 h-4 text-cyan-400" />;
        case 'ts':
        case 'js':
            return <FileCode className="w-4 h-4 text-yellow-400" />;
        case 'md':
            return <FileText className="w-4 h-4 text-gray-400" />;
        default:
            return <FileIcon className="w-4 h-4 text-muted-foreground" />;
    }
};

function FileNode({ 
  node, 
  level = 0, 
  onSelectNode, 
  activeFileId, 
  onSetEditState,
  onSetDeleteOperation,
  onDragStart,
  onDragOver,
  onDrop,
  isBeingDragged,
  isDropTarget,
  isExpanded,
  onToggleFolder
}: { 
  node: FileSystemNode; 
  level?: number; 
  onSelectNode: (id: string, type: 'file' | 'folder') => void; 
  activeFileId: string | null; 
  onSetEditState: (id: string) => void;
  onSetDeleteOperation: (operation: DeleteOperation) => void;
  onDragStart: (e: React.DragEvent, nodeId: string) => void;
  onDragOver: (e: React.DragEvent, nodeId: string) => void;
  onDrop: (e: React.DragEvent, dropTargetId: string | null) => void;
  isBeingDragged: boolean;
  isDropTarget: boolean;
  isExpanded: boolean;
  onToggleFolder: (folderId: string) => void;
}) {
  const isFolder = node.type === 'folder';
  const isActive = activeFileId === node.id;

  const handleNodeClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-radix-popover-content]')) {
      return;
    }
    onSelectNode(node.id, node.type);
  };
  
  const handleDoubleClick = () => {
    if (isFolder) {
      onToggleFolder(node.id);
    }
  }

  const renderNodeName = () => (
    <span className="truncate text-sm select-none" onDoubleClick={handleDoubleClick}>{node.name}</span>
  );
  
  const FolderIconComponent = isExpanded ? FolderOpen : Folder;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, node.id)}
      className={cn("flex items-center space-x-2 py-1.5 px-2 rounded-md hover:bg-muted group cursor-pointer relative", {
        "bg-muted": isActive,
        "opacity-50": isBeingDragged,
        "bg-accent/20 border-2 border-dashed border-accent": isDropTarget && isFolder,
      })}
      onClick={handleNodeClick}
      onDragOver={(e) => onDragOver(e, node.id)}
      onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDrop(e, node.type === 'folder' ? node.id : null);
      }}
      style={{ paddingLeft: `${level * 1 + 0.5}rem` }}
      title={node.path}
    >
      {isFolder ? (
          <ChevronRight className={cn("w-4 h-4 transition-transform flex-shrink-0", isExpanded && "rotate-90")} />
      ) : (
        <div className="w-4" />
      )}

      {isFolder ? <FolderIconComponent className="w-4 h-4 text-accent" /> : <FileIconComponent filename={node.name} />}
      
      {renderNodeName()}

      <Popover>
          <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 absolute right-1 top-1/2 -translate-y-1/2" onClick={e => e.stopPropagation()} title={`Actions for ${node.name}`}>
                  <MoreVertical className="h-4 w-4" />
              </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-1" onClick={e => e.stopPropagation()}>
              <Button variant="ghost" className="w-full justify-start h-8 px-2" onClick={() => onSetEditState(node.id)}>
                  <Edit className="mr-2 h-4 w-4" /> Rename
              </Button>
               <Button variant="ghost" className="w-full justify-start h-8 px-2 text-destructive hover:text-destructive" onClick={() => onSetDeleteOperation({ type: 'delete', nodeId: node.id, nodeName: node.name })}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
          </PopoverContent>
      </Popover>
    </div>
  );
}

function EditNode({
  editState,
  initialName = '',
  level = 0,
}: {
  editState: NonNullable<EditState>;
  initialName?: string;
  level: number;
}) {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = () => {
    editState.onDone(name);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') editState.onCancel();
  };

  const isFolder = editState.type === 'create_folder';
  
  return (
    <div className="flex items-center space-x-2 py-1.5 px-2" style={{ paddingLeft: `${level * 1 + 0.5}rem` }}>
       <div className="w-4" />
       {isFolder ? <Folder className="w-4 h-4 text-accent" /> : <FileIcon className="w-4 h-4 text-muted-foreground" />}
       <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          className="bg-transparent border border-accent rounded-sm h-7 px-1 text-sm w-full"
       />
    </div>
  );
}

interface FileExplorerProps {
    files: FileSystemNode[];
    openFileIds: string[];
    activeFileId: string | null;
    onSelectFile: (id: string) => void;
    createFile: (name: string, parentId: string | null, content?: string) => string | null;
    createFolder: (name: string, parentId: string | null) => void;
    expandedFolders: Set<string>;
    onToggleFolder: (folderId: string, forceOpen?: boolean) => void;
    renameNode: (id: string, newName: string) => void;
    deleteNode: (id: string) => void;
    moveNode: (draggedNodeId: string, dropTargetId: string | null) => void;
    getTargetFolder: (id: string | null) => FileSystemNode | null;
    onOpenFile: (id: string) => void;
    refreshFileSystem: () => void;
}

export type FileExplorerRef = {
    startCreate: (type: 'create_file' | 'create_folder') => void;
};


export const FileExplorer = forwardRef<FileExplorerRef, FileExplorerProps>(({ files, openFileIds, activeFileId, onSelectFile, createFile, createFolder, expandedFolders, onToggleFolder, renameNode, deleteNode, moveNode, getTargetFolder, onOpenFile, refreshFileSystem }, ref) => {
  const [deleteOperation, setDeleteOperation] = useState<DeleteOperation>(null);
  const [generateOperation, setGenerateOperation] = useState<GenerateOperation>(null);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [generateFileName, setGenerateFileName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const [editState, setEditState] = useState<EditState>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  
  const findNodeInfo = (nodes: FileSystemNode[], id: string): {node: FileSystemNode, level: number, parentId: string | null} | null => {
    const find = (nodes: FileSystemNode[], level: number, parentId: string | null): {node: FileSystemNode, level: number, parentId: string | null} | null => {
      for (const node of nodes) {
        if (node.id === id) return {node, level, parentId};
        if (node.type === 'folder') {
          const found = find(node.children, level + 1, node.id);
          if (found) return found;
        }
      }
      return null;
    }
    return find(nodes, 0, null);
  };

  const handleGenerate = async () => {
    if (!generateOperation || generateOperation.type !== 'generate_code' || !generatePrompt || !generateFileName) return;
    
    setIsGenerating(true);
    try {
      const result = await generateCodeFromPrompt({
        prompt: generatePrompt,
        language: generateFileName.split('.').pop() || 'typescript',
      });
      const newFileId = createFile(generateFileName, generateOperation.parentId, result.code);

      if (newFileId) {
        onOpenFile(newFileId);
        toast({ title: "File Generated", description: `${generateFileName} was created.` });
      }

    } catch (error) {
      console.error("AI code generation failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate code from prompt.",
      });
    } finally {
      setIsGenerating(false);
      setGenerateOperation(null);
      setGeneratePrompt('');
      setGenerateFileName('');
    }
  };
  
  const handleDelete = () => {
    if(deleteOperation?.type === 'delete') {
      deleteNode(deleteOperation.nodeId);
    }
    setDeleteOperation(null);
  };

  const handleSelectNode = (id: string, type: 'file' | 'folder') => {
    if (type === 'file') {
      onSelectFile(id);
    } else {
       onToggleFolder(id);
    }
  }

  const handleSetEditState = (state: EditState) => {
    if (editState) {
      editState.onCancel(); 
    }
    setEditState(state);
  };
  
  const getParentIdForNewNode = () => {
    const targetFolder = getTargetFolder(activeFileId);
    return targetFolder ? targetFolder.id : null;
  }

  const startCreate = (type: 'create_file' | 'create_folder') => {
    const parentId = getParentIdForNewNode();
    if(parentId) onToggleFolder(parentId, true);

    handleSetEditState({
      id: `new-${type}-${Date.now()}`,
      type: type,
      parentId: parentId,
      onDone: (name) => {
        if (name) {
          if (type === 'create_file') {
            const newFileId = createFile(name, parentId);
            if (newFileId) onOpenFile(newFileId);
          } else {
            createFolder(name, parentId);
          }
        }
        setEditState(null);
      },
      onCancel: () => setEditState(null),
    });
  };

  useImperativeHandle(ref, () => ({
      startCreate,
  }));

  const startRename = (id: string) => {
    const nodeInfo = findNodeInfo(files, id);
    if (!nodeInfo) return;

    handleSetEditState({
      id: nodeInfo.node.id,
      type: 'rename',
      parentId: nodeInfo.parentId,
      onDone: (newName) => {
        if (newName && newName !== nodeInfo.node.name) {
          renameNode(id, newName);
        }
        setEditState(null);
      },
      onCancel: () => setEditState(null),
    })
  }

  const handleDragStart = (e: React.DragEvent, nodeId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', nodeId);
    setDraggedNodeId(nodeId);
  };

  const handleDragOver = (e: React.DragEvent, nodeId: string) => {
    e.preventDefault();
    const nodeInfo = findNodeInfo(files, nodeId);
    if (nodeInfo?.node.type === 'folder') {
        setDropTargetId(nodeId);
        onToggleFolder(nodeId, true);
    } else {
        const parentInfo = nodeInfo?.parentId ? findNodeInfo(files, nodeInfo.parentId) : null;
        setDropTargetId(parentInfo?.node.id ?? null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropTargetId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedNodeId = e.dataTransfer.getData('text/plain');
    if (draggedNodeId) {
        moveNode(draggedNodeId, dropTargetId);
    }
    setDraggedNodeId(null);
    setDropTargetId(null);
  };

  const handleDragEnd = () => {
      setDraggedNodeId(null);
      setDropTargetId(null);
  };
  
  const handleRefresh = () => {
      refreshFileSystem();
      toast({ title: "Refreshed", description: "File explorer has been refreshed." });
  };
  
  const renderFileTree = (nodes: FileSystemNode[], level = 0): React.ReactNode[] => {
    const sortedNodes = [...nodes].sort((a, b) => {
        if (a.type === 'folder' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
    });

    return sortedNodes.flatMap(node => {
        const isFolder = node.type === 'folder';
        const isExpanded = isFolder && expandedFolders.has(node.id);
        const isEditing = editState?.type === 'rename' && editState.id === node.id;
        
        const nodeComponent = isEditing ? (
            <EditNode key={node.id} editState={editState!} initialName={node.name} level={level} />
        ) : (
          <FileNode 
              key={node.id}
              node={node} 
              level={level}
              onSelectNode={handleSelectNode} 
              activeFileId={activeFileId}
              onSetEditState={startRename}
              onSetDeleteOperation={setDeleteOperation}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isBeingDragged={draggedNodeId === node.id}
              isDropTarget={dropTargetId === node.id && node.type === 'folder'}
              isExpanded={isExpanded}
              onToggleFolder={onToggleFolder}
          />
        );

        let childrenComponents: React.ReactNode[] = [];
        if (isExpanded) {
            childrenComponents = renderFileTree(node.children, level + 1);
            if (editState && (editState.type === 'create_file' || editState.type === 'create_folder') && editState.parentId === node.id) {
                childrenComponents.push(<EditNode key={editState.id} editState={editState} level={level + 1} />);
            }
        }
        
        return [nodeComponent, ...childrenComponents];
    });
  };


  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <p className="text-sm text-muted-foreground mb-4">No files yet.</p>
      <Button onClick={() => startCreate('create_file')}>
        <FilePlus className="mr-2 h-4 w-4"/> Create a File
      </Button>
    </div>
  );

  return (
    <div className="h-full flex flex-col" onDragEnd={handleDragEnd} onDrop={(e) => handleDrop(e, null)}>
      <div className="p-2 border-b flex items-center justify-between h-12">
        <h2 className="text-sm font-semibold tracking-tight px-2 uppercase text-muted-foreground">Explorer</h2>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setGenerateOperation({type: 'generate_code', parentId: getParentIdForNewNode() })} title="Generate Code">
                <Wand2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>Generate Code</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startCreate('create_file')} title="New File">
                <FilePlus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>New File</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startCreate('create_folder')} title="New Folder">
                <FolderPlus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>New Folder</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh} title="Refresh Explorer">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>Refresh Explorer</p></TooltipContent>
          </Tooltip>
        </div>
      </div>
      <ScrollArea className="flex-1" onDragOver={(e) => e.preventDefault()}>
        <Collapsible defaultOpen={true}>
          <CollapsibleTrigger className="flex items-center justify-between w-full text-xs uppercase text-muted-foreground font-semibold p-2 hover:bg-muted">
            Open Editors
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-0.5 p-2">
              {openFileIds.map(id => {
                const file = files.find(f => f.id === id) || files.flatMap(f => f.type === 'folder' ? f.children : []).find(f => f.id === id);
                return file ? (
                  <div key={`open-${id}`} className={cn("flex items-center space-x-2 py-1.5 px-2 rounded-md hover:bg-muted group cursor-pointer relative", { "bg-muted": activeFileId === id })} onClick={() => onSelectFile(id)}>
                      <FileIconComponent filename={file.name} />
                      <span className="truncate text-sm select-none">{file.name}</span>
                  </div>
                ) : null
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen={true}>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-xs uppercase text-muted-foreground font-semibold p-2 hover:bg-muted">
                File System
                <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-2">
                {files.length === 0 && !editState ? renderEmptyState() : (
                  <div className="space-y-0.5">
                    {renderFileTree(files)}
                    {editState && (editState.type === 'create_file' || editState.type === 'create_folder') && editState.parentId === null && (
                      <EditNode editState={editState} level={0} />
                    )}
                  </div>
                )}
              </div>
            </CollapsibleContent>
        </Collapsible>
      </ScrollArea>

      <Dialog open={!!generateOperation} onOpenChange={() => { setGenerateOperation(null); setGeneratePrompt(''); setGenerateFileName(''); }}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Generate Code in '{getTargetFolder(generateOperation?.parentId ?? null)?.name ?? 'root'}'</DialogTitle>
            <DialogDescription>
              Describe the code you want to generate. Be specific for the best results.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="filename" className="text-right">File Name</Label>
              <Input id="filename" value={generateFileName} onChange={(e) => setGenerateFileName(e.target.value)} className="col-span-3" placeholder="e.g., button.tsx" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="prompt" className="text-right pt-2">Prompt</Label>
              <Textarea id="prompt" value={generatePrompt} onChange={(e) => setGeneratePrompt(e.target.value)} className="col-span-3" rows={8} placeholder="e.g., a React button component with primary and secondary variants using Tailwind CSS" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate Code'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!deleteOperation} onOpenChange={() => setDeleteOperation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the {deleteOperation ? `'${deleteOperation.nodeName}'` : 'item'}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
             <Button variant="outline" onClick={() => setDeleteOperation(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

FileExplorer.displayName = 'FileExplorer';
