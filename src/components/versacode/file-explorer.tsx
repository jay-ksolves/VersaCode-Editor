"use client";

import { Folder, File as FileIcon, ChevronRight, ChevronDown, FolderPlus, FilePlus } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import type { FileSystemNode } from "@/hooks/useFileSystem";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface FileExplorerProps {
  files: FileSystemNode[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onCreateFile: () => void;
  onCreateFolder: () => void;
}

function FileNode({ node, level = 0, onSelectFile, activeFileId }: { node: FileSystemNode; level?: number; onSelectFile: (id: string) => void; activeFileId: string | null; }) {
  const [isOpen, setIsOpen] = useState(true);
  const isFolder = node.type === 'folder';
  const isActive = activeFileId === node.id;

  const handleNodeClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(node.id);
    }
  };

  return (
    <div>
      <div
        className={cn("flex items-center space-x-2 py-1.5 px-2 rounded-md hover:bg-muted cursor-pointer", {
          "bg-muted": isActive,
        })}
        onClick={handleNodeClick}
        style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
      >
        {isFolder ? (
          isOpen ? <ChevronDown className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />
        ) : (
          <div style={{ width: '1rem' }} /> /* Spacer for alignment */
        )}
        {isFolder ? <Folder className="w-4 h-4 text-accent" /> : <FileIcon className="w-4 h-4 text-muted-foreground" />}
        <span className="truncate text-sm select-none">{node.name}</span>
      </div>
      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileNode key={child.id} node={child} level={level + 1} onSelectFile={onSelectFile} activeFileId={activeFileId} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({ files, activeFileId, onSelectFile, onCreateFile, onCreateFolder }: FileExplorerProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight px-2">Explorer</h2>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCreateFile}>
                <FilePlus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>New File</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCreateFolder}>
                <FolderPlus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>New Folder</p></TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-1">
          {files.map((node) => (
            <FileNode key={node.id} node={node} onSelectFile={onSelectFile} activeFileId={activeFileId} />
          ))}
        </div>
      </div>
    </div>
  );
}
