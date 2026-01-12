
'use client';

import { X } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FileSystemNode } from '@/hooks/useFileSystem';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

interface EditorTabsProps {
  openFileIds: string[];
  activeFileId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, force?: boolean) => void;
  findNodeById: (id:string) => FileSystemNode | null;
  dirtyFileIds: Set<string>;
  onNewUntitled: () => void;
}

export function EditorTabs({
  openFileIds,
  activeFileId,
  onSelectTab,
  onCloseTab,
  findNodeById,
  dirtyFileIds,
  onNewUntitled,
}: EditorTabsProps) {

  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onCloseTab(id);
  }

  const handleAuxClick = (e: React.MouseEvent, id: string) => {
    // Handle middle mouse button click
    if (e.button === 1) {
      e.preventDefault();
      onCloseTab(id);
    }
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap bg-card border-b" onDoubleClick={onNewUntitled}>
      <div className="flex h-full">
        {openFileIds.map((id) => {
          const file = findNodeById(id);
          if (!file || file.type !== 'file') return null;

          const isActive = id === activeFileId;
          const isDirty = dirtyFileIds.has(id);

          return (
            <div
              key={id}
              onClick={() => onSelectTab(id)}
              onAuxClick={(e) => handleAuxClick(e, id)}
              className={cn(
                'flex items-center gap-2 pl-4 pr-2 border-r cursor-pointer text-sm group relative min-w-max',
                isActive ? 'bg-background text-foreground' : 'bg-card text-muted-foreground hover:bg-muted',
              )}
              title={file.path}
            >
              {isActive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />}

              <span>{file.name}</span>
              <div
                className="h-6 w-6 rounded-full flex items-center justify-center cursor-pointer"
                onClick={(e) => handleClose(e, id)}
                title={`Close ${file.name}`}
              >
                {isDirty ? (
                  <div className="group-hover:hidden w-2 h-2 rounded-full bg-foreground/50" />
                ) : (
                  <div className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                )}
                <X className="h-4 w-4 hidden group-hover:block" />
              </div>
            </div>
          );
        })}
         {/* This empty div acts as the double-click target when no files are open or to the right of tabs */}
        <div className="flex-grow h-full" onDoubleClick={onNewUntitled} />
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
