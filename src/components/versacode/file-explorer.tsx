
"use client";

import { Folder, File as FileIcon, ChevronRight, ChevronDown, FolderPlus, FilePlus, MoreVertical, Edit, Trash2, Wand2 } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
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


function FileNode({ 
  node, 
  level = 0, 
  onSelectNode, 
  activeFileId, 
  isExpanded, 
  onToggleFolder,
  onSetEditState,
  onSetDeleteOperation,
  expandedFolders,
}: { 
  node: FileSystemNode; 
  level?: number; 
  onSelectNode: (id: string, type: 'file' | 'folder') => void; 
  activeFileId: string | null; 
  isExpanded: boolean;
  onToggleFolder: (folderId: string) => void;
  onSetEditState: (state: EditState) => void;
  onSetDeleteOperation: (operation: DeleteOperation) => void;
  expandedFolders: Set<string>;
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
    onSetEditState({
      id: node.id,
      type: 'rename',
      parentId: null, // Not needed for rename
      onDone: (newName) => {
        // The rename logic is handled by useFileSystem
      },
      onCancel: () => {}
    });
  }

  const renderNodeName = () => (
    <span className="truncate text-sm select-none" onDoubleClick={handleDoubleClick}>{node.name}</span>
  );

  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

  return (
    <div>
      <div
        className={cn("flex items-center space-x-2 py-1 px-2 rounded-md hover:bg-muted group cursor-pointer", {
          "bg-muted": isActive && !isFolder,
        })}
        onClick={handleNodeClick}
        style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
        title={node.path}
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
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100" onClick={e => e.stopPropagation()} title={`Actions for ${node.name}`}>
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" className="w-full justify-start h-8 px-2" onClick={handleDoubleClick}>
                    <Edit className="mr-2 h-4 w-4" /> Rename
                </Button>
                 <Button variant="ghost" className="w-full justify-start h-8 px-2 text-destructive hover:text-destructive" onClick={() => onSetDeleteOperation({ type: 'delete', nodeId: node.id, nodeName: node.name })}>
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
              onSetEditState={onSetEditState}
              onSetDeleteOperation={onSetDeleteOperation}
              expandedFolders={expandedFolders}
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

function EditNode({
  editState,
  initialName = '',
}: {
  editState: NonNullable<EditState>;
  initialName?: string;
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
    <div className="flex items-center space-x-2 py-1 px-2" style={{ paddingLeft: `${editState.id ? (Number(editState.id.split('-').pop()) + 1) * 1.25 : 0.5}rem` }}>
       <div style={{ width: '1rem' }} />
       {isFolder ? <Folder className="w-4 h-4 text-accent" /> : <FileIcon className="w-4 h-4 text-muted-foreground" />}
       <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          className="bg-transparent border border-accent rounded-sm h-6 px-1 text-sm w-full"
       />
    </div>
  );
}


export function FileExplorer({ files, activeFileId, onSelectFile, createFile, createFolder, expandedFolders, onToggleFolder, renameNode, deleteNode, getTargetFolder, onOpenFile }) {
  const [deleteOperation, setDeleteOperation] = useState<DeleteOperation>(null);
  const [generateOperation, setGenerateOperation] = useState<GenerateOperation>(null);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [generateFileName, setGenerateFileName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const [editState, setEditState] = useState<EditState>(null);
  
  const findNode = (id: string | null) => id ? files.flatMap(f => f.type === 'folder' ? [f, ...f.children] : [f]).find(f => f.id === id) : null;

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
    if (editState) { // If there's already an edit in progress, finalize it.
      editState.onDone(''); 
    }
    setEditState(state);
  };
  
  const parentIdForNewNode = getTargetFolder(activeFileId)?.id ?? null;

  const startCreate = (type: 'create_file' | 'create_folder') => {
    handleSetEditState({
      id: `new-${type}-${Date.now()}`,
      type: type,
      parentId: parentIdForNewNode,
      onDone: (name) => {
        if (name) {
          if (type === 'create_file') {
            createFile(name, parentIdForNewNode);
          } else {
            createFolder(name, parentIdForNewNode);
          }
        }
        setEditState(null);
      },
      onCancel: () => setEditState(null),
    });
  };

  const startRename = (id: string) => {
    const node = findNode(id);
    if (!node) return;

    handleSetEditState({
      id: node.id,
      type: 'rename',
      parentId: getTargetFolder(id)?.id ?? null,
      onDone: (newName) => {
        if (newName && newName !== node.name) {
          renameNode(id, newName);
        }
        setEditState(null);
      },
      onCancel: () => setEditState(null),
    })
  }

  const renderFileTree = (nodes: FileSystemNode[], level = 0) => {
    return nodes.map(node => (
        <React.Fragment key={node.id}>
            {editState?.type === 'rename' && editState.id === node.id ? (
              <EditNode editState={editState} initialName={node.name} />
            ) : (
              <FileNode 
                node={node} 
                level={level}
                onSelectNode={handleSelectNode} 
                activeFileId={activeFileId}
                isExpanded={expandedFolders.has(node.id)}
                onToggleFolder={onToggleFolder}
                onSetEditState={() => startRename(node.id)}
                onSetDeleteOperation={setDeleteOperation}
                expandedFolders={expandedFolders}
              />
            )}
            {node.type === 'folder' && expandedFolders.has(node.id) && (
              <>
                {renderFileTree(node.children, level + 1)}
                {editState && (editState.type === 'create_file' || editState.type === 'create_folder') && editState.parentId === node.id && (
                  <EditNode editState={editState} />
                )}
              </>
            )}
        </React.Fragment>
    ));
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
    <div className="h-full flex flex-col">
      <div className="p-2 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight px-2">Explorer</h2>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setGenerateOperation({type: 'generate_code', parentId: parentIdForNewNode })} title="Generate Code">
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
        </div>
      </div>
      <div className="flex-1 p-2 overflow-y-auto">
        {files.length === 0 ? renderEmptyState() : (
          <div className="space-y-1">
            {renderFileTree(files)}
            {editState && (editState.type === 'create_file' || editState.type === 'create_folder') && editState.parentId === null && (
              <EditNode editState={editState} />
            )}
          </div>
        )}
      </div>

      {/* Generate Code Dialog */}
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
      
      {/* Delete Confirmation Dialog */}
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
}
