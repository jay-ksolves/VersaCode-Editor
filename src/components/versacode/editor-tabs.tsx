
'use client';

import { X } from 'lucide-react';
import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import type { FileSystemNode } from '@/hooks/useFileSystem';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { FileIconComponent } from './file-explorer';
import type { IdeCommand } from '@/lib/extensions-api';

interface EditorTabsProps {
  openFileIds: string[];
  activeFileId: string | null;
  onSelectTab: (id: string) => void;
  onReorderTabs: (reorderedIds: string[]) => void;
  findNodeById: (id: string) => FileSystemNode | null;
  onNewUntitled: () => void;
  getCommandsForContext: (context: string) => IdeCommand[];
  onCommand: (commandId: string, context?: any) => void;
}

export function EditorTabs({
  openFileIds,
  activeFileId,
  onSelectTab,
  onReorderTabs,
  findNodeById,
  onNewUntitled,
  getCommandsForContext,
  onCommand,
}: EditorTabsProps) {
  const dragTabId = useRef<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    dragTabId.current = id;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropTargetId: string) => {
    e.preventDefault();
    if (!dragTabId.current || dragTabId.current === dropTargetId) return;

    const draggedIndex = openFileIds.indexOf(dragTabId.current);
    const targetIndex = openFileIds.indexOf(dropTargetId);

    const reordered = [...openFileIds];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);
    onReorderTabs(reordered);

    dragTabId.current = null;
  };

  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onCommand('tab:close', { fileId: id });
  };
  
  const handleAuxClick = (e: React.MouseEvent, id: string) => {
    if (e.button === 1) { // Middle mouse button
      e.preventDefault();
      onCommand('tab:close', { fileId: id });
    }
  };

  const tabContextMenuCommands = getCommandsForContext('editor/tab/context');

  return (
    <ScrollArea className="w-full whitespace-nowrap bg-card border-b" onDoubleClick={onNewUntitled} data-testid="editor-tabs-container">
      <div className="flex h-full">
        {openFileIds.map((id) => {
          const file = findNodeById(id);
          if (!file || file.type !== 'file') return null;

          const isActive = id === activeFileId;

          return (
            <DropdownMenu key={id}>
              <DropdownMenuTrigger asChild>
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, id)}
                  onClick={() => onSelectTab(id)}
                  onAuxClick={(e) => handleAuxClick(e, id)}
                  onContextMenu={(e) => e.preventDefault()} // Allow dropdown trigger to handle it
                  data-testid={`editor-tab-${file.path}`}
                  className={cn(
                    'flex items-center gap-2 pl-4 pr-2 border-r cursor-pointer text-sm group relative min-w-max',
                    isActive ? 'bg-background text-foreground' : 'bg-card text-muted-foreground hover:bg-muted'
                  )}
                  title={file.path}
                >
                  {isActive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />}

                  <FileIconComponent filename={file.name} />
                  <span>{file.name}</span>

                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center cursor-pointer"
                    onClick={(e) => handleClose(e, id)}
                    title={`Close ${file.name}`}
                    data-testid={`editor-tab-close-${file.path}`}
                  >
                    <X className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {tabContextMenuCommands.map((command, index) => {
                  if (command.id === 'separator') {
                    return <DropdownMenuSeparator key={`sep-${index}`} />;
                  }
                  return (
                    <DropdownMenuItem 
                      key={command.id}
                      onClick={() => onCommand(command.id, { fileId: id })}
                      data-testid={`editor-tab-context-menu-${command.id.replace(/:/g, '-')}-${file.path}`}
                    >
                      {command.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}
        <div className="flex-grow h-full" onDoubleClick={onNewUntitled} />
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
