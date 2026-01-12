
'use client';

import { ChevronRight } from 'lucide-react';
import type { FileSystemNode } from '@/hooks/useFileSystem';

interface BreadcrumbsProps {
  activeFile: FileSystemNode | null;
  findNodeById: (id: string) => FileSystemNode | null;
  onSelect: (id: string) => void;
}

export function Breadcrumbs({ activeFile, findNodeById, onSelect }: BreadcrumbsProps) {
  if (!activeFile) {
    return <div className="h-10 flex items-center px-4 text-sm text-muted-foreground italic border-b">No file selected</div>;
  }

  const pathParts = activeFile.path.split('/');

  return (
    <div className="flex items-center h-10 px-4 border-b text-sm text-muted-foreground">
      {pathParts.map((part, index) => {
        const isLast = index === pathParts.length - 1;
        const currentPath = pathParts.slice(0, index + 1).join('/');
        
        // This is a simplified lookup; a real implementation might need a more robust findNodeByPath
        let nodeId: string | null = null;
        if (activeFile.path === currentPath) {
          nodeId = activeFile.id;
        }

        return (
          <React.Fragment key={index}>
            <span
              className={cn('px-2 py-1 rounded-md', {
                'text-foreground font-medium': isLast,
                'hover:bg-muted cursor-pointer': !isLast && nodeId,
              })}
            >
              {part}
            </span>
            {!isLast && <ChevronRight className="h-4 w-4" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Minimal cn utility for the new component
function cn(...inputs: (string | boolean | undefined | null)[]) {
  return inputs.filter(Boolean).join(' ');
}
