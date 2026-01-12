
'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FileSystemNode } from '@/hooks/useFileSystem';

interface EditorTabsProps {
  openFileIds: string[];
  activeFileId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  findNodeById: (id: string) => FileSystemNode | null;
  dirtyFileIds: Set<string>;
}

export function EditorTabs({
  openFileIds,
  activeFileId,
  onSelectTab,
  onCloseTab,
  findNodeById,
  dirtyFileIds,
}: EditorTabsProps) {
  if (openFileIds.length === 0) {
    return (
        <div className="h-[41px] border-b bg-card" /> // Maintain layout consistency
    );
  }

  return (
    <div className="flex border-b bg-card">
      {openFileIds.map((id) => {
        const file = findNodeById(id);
        if (!file || file.type !== 'file') return null;

        const isActive = id === activeFileId;
        const isDirty = dirtyFileIds.has(id);

        return (
          <div
            key={id}
            onClick={() => onSelectTab(id)}
            className={cn(
              'flex items-center gap-2 pl-4 pr-2 py-2 border-r cursor-pointer text-sm group relative',
              isActive
                ? 'bg-background text-foreground'
                : 'bg-card text-muted-foreground hover:bg-muted',
            )}
            title={file.path}
          >
            {/* Active tab indicator */}
            {isActive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />}

            <span>{file.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className='h-6 w-6 rounded-full'
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(id);
              }}
              title={`Close ${file.name}`}
            >
              {isDirty ? (
                 <div className="group-hover:hidden w-2 h-2 rounded-full bg-foreground/50" />
              ) : null}
               <X className="h-4 w-4 hidden group-hover:block" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
