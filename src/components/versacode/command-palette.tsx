
'use client';

import { useState, useEffect, useCallback } from 'react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { File, Code, ToggleRight } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommand: (commandId: string) => void;
}

const commands = [
    { id: 'theme:toggle', name: 'Toggle Theme', icon: <ToggleRight />, group: 'Appearance' },
    { id: 'file:new', name: 'New File', icon: <File />, group: 'File' },
    { id: 'editor:format', name: 'Format Document', icon: <Code />, group: 'Editor' },
];

export function CommandPalette({ open, onOpenChange, onCommand }: CommandPaletteProps) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);
  
  const runCommand = useCallback((command: () => unknown) => {
    onOpenChange(false)
    command()
  }, [onOpenChange])

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="File">
          <CommandItem onSelect={() => runCommand(() => onCommand('file:new'))}>
            <File className="mr-2 h-4 w-4" />
            <span>New File</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Editor">
            <CommandItem onSelect={() => runCommand(() => onCommand('editor:format'))}>
                <Code className="mr-2 h-4 w-4" />
                <span>Format Document</span>
            </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Appearance">
          <CommandItem onSelect={() => runCommand(() => onCommand('theme:toggle'))}>
            <ToggleRight className="mr-2 h-4 w-4" />
            <span>Toggle Theme</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
