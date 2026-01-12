
'use client';

import { GitBranch, XCircle, AlertTriangle, Sparkles, Bell, Check } from 'lucide-react';
import type { FileSystemNode } from '@/hooks/useFileSystem';
import type { Problem } from './ide-layout';
import { formatDistanceToNow } from 'date-fns';

interface StatusBarProps {
  activeFile: (FileSystemNode & { type: 'file' }) | null;
  problems: Problem[];
  lastSaved: Date | null;
}

export function StatusBar({ activeFile, problems, lastSaved }: StatusBarProps) {
  const errorCount = problems.filter(p => p.severity === 'error').length;
  const warningCount = problems.filter(p => p.severity === 'warning').length;
  
  const getLanguageName = (filename: string | undefined) => {
    if (!filename) return 'Plain Text';
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js': return 'JavaScript';
      case 'ts': return 'TypeScript';
      case 'tsx': return 'TypeScript JSX';
      case 'css': return 'CSS';
      case 'json': return 'JSON';
      case 'md': return 'Markdown';
      case 'html': return 'HTML';
      default: return 'Plain Text';
    }
  };

  return (
    <footer className="h-6 bg-card border-t flex items-center justify-between px-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
            <GitBranch className="h-3.5 w-3.5" />
            <span>main</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                <XCircle className="h-3.5 w-3.5" />
                <span>{errorCount}</span>
            </div>
             <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{warningCount}</span>
            </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {lastSaved && (
            <div className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                <span>Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}</span>
            </div>
        )}
        <span>{activeFile ? getLanguageName(activeFile.name) : ''}</span>
        <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Genkit</span>
        </div>
        <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
            <Bell className="h-3.5 w-3.5" />
        </div>
      </div>
    </footer>
  );
}

    