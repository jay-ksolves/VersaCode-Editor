"use client";

import { Folder, File as FileIcon, ChevronRight, ChevronDown, FolderPlus, FilePlus, MoreVertical, Edit, Trash2 } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { FileSystemNode } from "@/hooks/useFileSystem";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type Operation = { type: 'create_file', parentId: string | null } | { type: 'create_folder', parentId: string | null } | { type: 'delete', nodeId: string, nodeName: string } | null;

function FileNode({ 
  node, 
  level = 0, 
  onSelectNode, 
  activeFileId, 
  isExpanded, 
  onToggleFolder,
  onRename,
  onSetOperation,
}: { 
  node: FileSystemNode; 
  level?: number; 
  onSelectNode: (id: string, type: 'file' | 'folder') => void; 
  activeFileId: string | null; 
  isExpanded: boolean;
  onToggleFolder: (folderId: string) => void;
  onRename: (nodeId: string, newName: string) => void;
  onSetOperation: (operation: Operation) => void;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const isFolder = node.type === 'folder';
  const isActive = activeFileId === node.id;

  const handleNodeClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-radix-popover-content]')) {
        return;
    }
    onSelectNode(node.id, node.type);
  };

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  const handleRenameSubmit = () => {
    if (renameValue && renameValue !== node.name) {
        onRename(node.id, renameValue);
    }
    setIsRenaming(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') setIsRenaming(false);
  }

  const renderNodeName = () => {
    if (isRenaming) {
        return (
            <input 
                ref={inputRef}
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={handleKeyDown}
                className="bg-transparent border border-accent rounded-sm h-6 px-1 text-sm w-full"
            />
        )
    }
    return <span className="truncate text-sm select-none">{node.name}</span>
  }

  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

  return (
    <div>
      <div
        className={cn("flex items-center space-x-2 py-1 px-2 rounded-md hover:bg-muted group cursor-pointer", {
          "bg-muted": isActive && !isFolder,
        })}
        onClick={handleNodeClick}
        style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
      >
        {isFolder ? (
          <ChevronIcon onClick={(e) => { e.stopPropagation(); onToggleFolder(node.id); }} className="w-4 h-4 flex-shrink-0" />
        ) : (
          <div style={{ width: '1rem' }} /> /* Spacer for alignment */
        )}
        {isFolder ? <Folder className="w-4 h-4 text-accent" /> : <FileIcon className="w-4 h-4 text-muted-foreground" />}
        
        {renderNodeName()}

        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" className="w-full justify-start h-8 px-2" onClick={() => setIsRenaming(true)}>
                    <Edit className="mr-2 h-4 w-4" /> Rename
                </Button>
                 <Button variant="ghost" className="w-full justify-start h-8 px-2 text-destructive hover:text-destructive" onClick={() => onSetOperation({ type: 'delete', nodeId: node.id, nodeName: node.name })}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
            </PopoverContent>
        </Popover>

      </div>
      {isFolder && isExpanded && (
        <div>
          {node.children && node.children.length > 0 ? node.children.map((child) => (
            <FileNode 
              key={child.id} 
              node={child} 
              level={level + 1} 
              onSelectNode={onSelectNode} 
              activeFileId={activeFileId} 
              isExpanded={expandedFolders.has(child.id)}
              onToggleFolder={onToggleFolder}
              onRename={onRename}
              onSetOperation={onSetOperation}
            />
          )) : (
            <div style={{ paddingLeft: `${(level + 1) * 1.25 + 0.5}rem` }} className="text-xs text-muted-foreground py-1 px-2 italic">
              Empty folder
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({ files, activeFileId, onSelectFile, onCreateFile, onCreateFolder, expandedFolders, onToggleFolder, onRename, onDeleteNode, getTargetFolder }) {
  const [operation, setOperation] = useState<Operation>(null);
  const [newNodeName, setNewNodeName] = useState('');

  const handleCreate = () => {
    if (!operation || (operation.type !== 'create_file' && operation.type !== 'create_folder')) return;

    if (operation.type === 'create_file') {
      onCreateFile(newNodeName, operation.parentId);
    } else {
      onCreateFolder(newNodeName, operation.parentId);
    }
    setOperation(null);
    setNewNodeName('');
  };
  
  const handleDelete = () => {
    if(operation?.type === 'delete') {
      onDeleteNode(operation.nodeId);
    }
    setOperation(null);
  };

  const handleSelectNode = (id: string, type: 'file' | 'folder') => {
    if (type === 'file') {
      onSelectFile(id);
    } else {
      onToggleFolder(id);
    }
  }
  
  const getCreateDialogTitle = () => {
      if (!operation) return '';
      const target = getTargetFolder(operation.parentId);
      const targetName = target ? target.name : 'root';
      const type = operation.type === 'create_file' ? 'File' : 'Folder';
      return `Create New ${type} in '${targetName}'`;
  }

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <p className="text-sm text-muted-foreground mb-4">No files yet.</p>
      <Button onClick={() => setOperation({ type: 'create_file', parentId: null })}>
        <FilePlus className="mr-2 h-4 w-4"/> Create a File
      </Button>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight px-2">Explorer</h2>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOperation({type: 'create_file', parentId: getTargetFolder(activeFileId)?.id ?? null })}>
                <FilePlus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>New File</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOperation({type: 'create_folder', parentId: getTargetFolder(activeFileId)?.id ?? null })}>
                <FolderPlus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>New Folder</p></TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="flex-1 p-2 overflow-y-auto">
        {files.length === 0 ? renderEmptyState() : (
          <div className="space-y-1">
            {files.map((node) => (
              <FileNode 
                key={node.id} 
                node={node} 
                onSelectNode={handleSelectNode} 
                activeFileId={activeFileId}
                isExpanded={expandedFolders.has(node.id)}
                onToggleFolder={onToggleFolder}
                onRename={onRename}
                onSetOperation={setOperation}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={operation?.type === 'create_file' || operation?.type === 'create_folder'} onOpenChange={() => { setOperation(null); setNewNodeName('')}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getCreateDialogTitle()}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={newNodeName} onChange={(e) => setNewNodeName(e.target.value)} className="col-span-3" onKeyDown={(e) => e.key === 'Enter' && handleCreate()} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={operation?.type === 'delete'} onOpenChange={() => setOperation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the {operation?.type === 'delete' ? `'${operation.nodeName}'` : 'item'}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
             <Button variant="outline" onClick={() => setOperation(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
