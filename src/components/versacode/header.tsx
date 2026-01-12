
'use client';

import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, Sparkles, LoaderCircle, Indent, Command, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onSuggest: () => void;
  onFormat: () => void;
  onTriggerAction: (action: string) => void;
  isSuggesting: boolean;
  isFormatting: boolean;
  onNewFile: () => void;
  onNewFolder: () => void;
  onUploadFolder: () => void;
  onToggleMinimap: (checked: boolean) => void;
  isMinimapVisible: boolean;
  onNewTerminal: () => void;
  onToggleTerminal: () => void;
  logOutput: (message: string) => void;
  onCommandPalette: () => void;
  onDownloadZip: () => void;
  theme: string;
  onToggleTheme: () => void;
  onCloseEditor: () => void;
}

export function Header({
  onSuggest,
  onFormat,
  onTriggerAction,
  isSuggesting,
  isFormatting,
  onNewFile,
  onNewFolder,
  onUploadFolder,
  onToggleMinimap,
  isMinimapVisible,
  onNewTerminal,
  onToggleTerminal,
  logOutput,
  onCommandPalette,
  onDownloadZip,
  theme,
  onToggleTheme,
  onCloseEditor,
}: HeaderProps) {
  
  const handleRun = () => {
    logOutput("Run command executed (placeholder).");
  };

  return (
    <header className="flex items-center justify-between h-12 px-4 border-b bg-card" data-testid="header">
      <div className="flex items-center gap-4">
        <Menubar className="border-none bg-transparent p-0">
          <MenubarMenu>
              <MenubarTrigger className="p-2" aria-label="Application Menu" data-testid="header-app-menu-trigger">
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-primary"
                    >
                    <path d="M14.4645 19.232L21.3698 12.3267L23.1421 14.099L16.2368 21.0043L14.4645 19.232Z" fill="currentColor"/>
                    <path d="M1.00439 14.099L7.90969 21.0043L9.68198 19.232L2.77668 12.3267L1.00439 14.099Z" fill="currentColor"/>
                    <path d="M9.17188 3L2.26658 9.9053L4.03887 11.6776L10.9442 4.7723L9.17188 3Z" fill="currentColor"/>
                    <path d="M21.8579 9.9053L14.9526 3L13.1803 4.7723L20.0856 11.6776L21.8579 9.9053Z" fill="currentColor"/>
                </svg>
              </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger data-testid="header-file-menu-trigger">File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={onNewFile} data-testid="header-file-new-file">
                New File <MenubarShortcut>Ctrl+N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={onNewFolder} data-testid="header-file-new-folder">New Folder</MenubarItem>
               <MenubarItem onClick={onUploadFolder} data-testid="header-file-upload-folder">
                Upload Folder...
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={onDownloadZip} data-testid="header-file-download-zip">Download Project (.zip)</MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={onCloseEditor} data-testid="header-file-close-editor">Close Editor</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger data-testid="header-edit-menu-trigger">Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => onTriggerAction('undo')} data-testid="header-edit-undo">
                Undo <MenubarShortcut>Ctrl+Z</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => onTriggerAction('redo')} data-testid="header-edit-redo">
                Redo <MenubarShortcut>Ctrl+Y</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={() => onTriggerAction('editor.action.clipboardCutAction')} data-testid="header-edit-cut">
                Cut <MenubarShortcut>Ctrl+X</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => onTriggerAction('editor.action.clipboardCopyAction')} data-testid="header-edit-copy">
                Copy <MenubarShortcut>Ctrl+C</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => onTriggerAction('editor.action.clipboardPasteAction')} data-testid="header-edit-paste">
                Paste <MenubarShortcut>Ctrl+V</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={onFormat} data-testid="header-edit-format">
                Format Document <MenubarShortcut>Ctrl+Alt+F</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger data-testid="header-view-menu-trigger">View</MenubarTrigger>
            <MenubarContent>
                <MenubarItem onClick={onCommandPalette} data-testid="header-view-command-palette">
                    Command Palette <MenubarShortcut>Ctrl+Shift+P</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarCheckboxItem
                    checked={isMinimapVisible}
                    onCheckedChange={onToggleMinimap}
                    data-testid="header-view-toggle-minimap"
                >
                    Show Minimap
                </MenubarCheckboxItem>
                 <MenubarCheckboxItem
                    checked={theme === 'dark'}
                    onCheckedChange={onToggleTheme}
                    data-testid="header-view-toggle-theme"
                >
                    Dark Mode
                </MenubarCheckboxItem>
                <MenubarSeparator />
                <MenubarItem onClick={onToggleTerminal} data-testid="header-view-toggle-terminal">Terminal</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger data-testid="header-run-menu-trigger">Run</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleRun} data-testid="header-run-run-code">Run Code</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger data-testid="header-terminal-menu-trigger">Terminal</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={onNewTerminal} data-testid="header-terminal-new-terminal">New Terminal</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger data-testid="header-help-menu-trigger">Help</MenubarTrigger>
            <MenubarContent>
               <MenubarItem onClick={() => window.open('https://github.com/FirebaseExtended/firebase-studio', '_blank')} data-testid="header-help-source-code">
                Source Code
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
             <Button variant="ghost" size="icon" onClick={onFormat} disabled={isFormatting} aria-label="Format Code" data-testid="header-format-button">
              {isFormatting ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <Indent className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Format Document</p>
             <p className="text-xs text-muted-foreground">Ctrl+Alt+F</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onSuggest} disabled={isSuggesting} aria-label="AI Code Suggestion" data-testid="header-suggest-button">
              {isSuggesting ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>AI Code Suggestion</p>
            <p className="text-xs text-muted-foreground">Ctrl+Space</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onCommandPalette} aria-label="Command Palette" data-testid="header-command-palette-button">
                    <Command className="h-5 w-5" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Command Palette</p>
                <p className="text-xs text-muted-foreground">Ctrl+Shift+P</p>
            </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" onClick={handleRun} className="bg-accent text-accent-foreground hover:bg-accent/90" aria-label="Run Code" data-testid="header-run-button">
              <Play className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Run Code</p>
          </TooltipContent>
        </Tooltip>
         <Button variant="ghost" size="icon" title="Toggle Theme" onClick={onToggleTheme} aria-label="Toggle Theme" data-testid="header-theme-toggle-button">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  );
}
