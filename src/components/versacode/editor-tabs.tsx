
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
}

export function EditorTabs({
  openFileIds,
  activeFileId,
  onSelectTab,
  onCloseTab,
  findNodeById,
}: EditorTabsProps) {
  if (openFileIds.length === 0) {
    return null;
  }

  return (
    <div className="flex border-b bg-card">
      {openFileIds.map((id) => {
        const file = findNodeById(id);
        if (!file || file.type !== 'file') return null;

        const isActive = id === activeFileId;

        return (
          <div
            key={id}
            onClick={() => onSelectTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 border-r cursor-pointer text-sm',
              isActive
                ? 'bg-background text-foreground'
                : 'bg-card text-muted-foreground hover:bg-muted'
            )}
          >
            <span>{file.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
