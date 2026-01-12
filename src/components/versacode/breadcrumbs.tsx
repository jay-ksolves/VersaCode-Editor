
'use client';

import { ChevronRight } from 'lucide-react';
import type { FileSystemNode } from '@/hooks/useFileSystem';
import React from 'react';
import { cn } from '@/lib/utils';

interface BreadcrumbsProps {
  activeFile: FileSystemNode | null;
  onSelectPath: (path: string) => void;
}

export function Breadcrumbs({ activeFile, onSelectPath }: BreadcrumbsProps) {
  if (!activeFile || !activeFile.path) {
    return <div className="h-10 flex items-center px-4 text-sm text-muted-foreground italic border-b">No file selected</div>;
  }

  const pathParts = activeFile.path.split('/');
  
  return (
    <div className="flex items-center h-10 px-4 border-b text-sm text-muted-foreground">
      {pathParts.map((part, index) => {
        const isLast = index === pathParts.length - 1;
        const currentPath = pathParts.slice(0, index + 1).join('/');
        
        return (
          <React.Fragment key={currentPath}>
            <span
              className={cn('px-2 py-1 rounded-md', {
                'text-foreground font-medium': isLast,
                'hover:bg-muted cursor-pointer': !isLast,
              })}
              onClick={() => onSelectPath(currentPath)}
              title={currentPath}
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
