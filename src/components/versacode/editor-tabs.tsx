
'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FileSystemNode } from '@/hooks/useFileSystem';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

interface EditorTabsProps {
  openFileIds: string[];
  activeFileId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, force?: boolean) => void;
  onCloseAllTabs: (force?: boolean) => void;
  onCloseOtherTabs: (id: string, force?: boolean) => void;
  onCloseToTheRight: (id: string, force?: boolean) => void;
  findNodeById: (id: string) => FileSystemNode | null;
  dirtyFileIds: Set<string>;
}

export function EditorTabs({
  openFileIds,
  activeFileId,
  onSelectTab,
  onCloseTab,
  onCloseAllTabs,
  onCloseOtherTabs,
  onCloseToTheRight,
  findNodeById,
  dirtyFileIds,
}: EditorTabsProps) {
  if (openFileIds.length === 0) {
    return <div className="h-[41px] border-b bg-card" />; // Maintain layout consistency
  }
  
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
    <ScrollArea className="w-full whitespace-nowrap bg-card border-b">
      <div className="flex">
        {openFileIds.map((id, index) => {
          const file = findNodeById(id);
          if (!file || file.type !== 'file') return null;

          const isActive = id === activeFileId;
          const isDirty = dirtyFileIds.has(id);

          return (
            <DropdownMenu key={id}>
              <DropdownMenuTrigger asChild>
                <div
                  onClick={() => onSelectTab(id)}
                  onAuxClick={(e) => handleAuxClick(e, id)}
                  onContextMenu={(e) => e.stopPropagation()} // Prevent native context menu on the trigger
                  className={cn(
                    'flex items-center gap-2 pl-4 pr-2 py-2 border-r cursor-pointer text-sm group relative min-w-max',
                    isActive
                      ? 'bg-background text-foreground'
                      : 'bg-card text-muted-foreground hover:bg-muted',
                  )}
                  title={file.path}
                >
                  {isActive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />}

                  <span>{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    onClick={(e) => handleClose(e, id)}
                    title={`Close ${file.name}`}
                  >
                    {isDirty ? (
                      <div className="group-hover:hidden w-2 h-2 rounded-full bg-foreground/50" />
                    ) : null}
                    <X className="h-4 w-4 hidden group-hover:block" />
                  </Button>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem onClick={() => onCloseTab(id)}>
                  Close
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => onCloseOtherTabs(id)}>
                  Close Others
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCloseToTheRight(id)}>
                  Close to the Right
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onCloseAllTabs()}>
                  Close All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
