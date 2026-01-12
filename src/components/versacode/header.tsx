
import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MenubarCheckboxItem,
} from "@/components/ui/menubar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, Sparkles, LoaderCircle, Indent, Command } from "lucide-react";

interface HeaderProps {
  onSuggest: () => void;
  onFormat: () => void;
  isSuggesting: boolean;
  isFormatting: boolean;
  onNewFile: () => void;
  onNewFolder: () => void;
  onToggleMinimap: (checked: boolean) => void;
  isMinimapVisible: boolean;
  onNewTerminal: () => void;
  onToggleTerminal: () => void;
  logOutput: (message: string) => void;
  onCommandPalette: () => void;
}

export function Header({
  onSuggest,
  onFormat,
  isSuggesting,
  isFormatting,
  onNewFile,
  onNewFolder,
  onToggleMinimap,
  isMinimapVisible,
  onNewTerminal,
  onToggleTerminal,
  logOutput,
  onCommandPalette,
}: HeaderProps) {
  
  const handleRun = () => {
    logOutput("Run command executed (placeholder).");
  };

  return (
    <header className="flex items-center justify-between h-12 px-4 border-b bg-card">
      <div className="flex items-center gap-4">
        <Menubar className="border-none bg-transparent">
          <MenubarMenu>
              <MenubarTrigger>
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
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={onNewFile}>
                New File <MenubarShortcut>Ctrl+N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={onNewFolder}>New Folder</MenubarItem>
              <MenubarSeparator />
              <MenubarItem disabled>
                Save <MenubarShortcut>Ctrl+S</MenubarShortcut>
              </MenubarItem>
              <MenubarItem disabled>Save As...</MenubarItem>
              <MenubarSeparator />
              <MenubarItem disabled>Close Editor</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem disabled>
                Undo <MenubarShortcut>Ctrl+Z</MenubarShortcut>
              </MenubarItem>
              <MenubarItem disabled>
                Redo <MenubarShortcut>Ctrl+Y</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem disabled>
                Cut <MenubarShortcut>Ctrl+X</MenubarShortcut>
              </MenubarItem>
              <MenubarItem disabled>
                Copy <MenubarShortcut>Ctrl+C</MenubarShortcut>
              </MenubarItem>
              <MenubarItem disabled>
                Paste <MenubarShortcut>Ctrl+V</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={onFormat}>
                Format Document <MenubarShortcut>Ctrl+Alt+F</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
                <MenubarItem onClick={onCommandPalette}>
                    Command Palette <MenubarShortcut>Ctrl+Shift+P</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarCheckboxItem
                    checked={isMinimapVisible}
                    onCheckedChange={onToggleMinimap}
                >
                    Show Minimap
                </MenubarCheckboxItem>
                <MenubarSeparator />
                <MenubarItem disabled>Explorer</MenubarItem>
                <MenubarItem onClick={onToggleTerminal}>Terminal</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Run</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleRun}>Run Code</MenubarItem>
              <MenubarItem disabled>Run With Debugger</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Terminal</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={onNewTerminal}>New Terminal</MenubarItem>
              <MenubarItem disabled>Split Terminal</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Help</MenubarTrigger>
            <MenubarContent>
              <MenubarItem disabled>Welcome</MenubarItem>
              <MenubarItem disabled>Documentation</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
             <Button variant="ghost" size="icon" onClick={onFormat} disabled={isFormatting} title="Format Code (Ctrl+Alt+F)">
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
            <Button variant="ghost" size="icon" onClick={onSuggest} disabled={isSuggesting} title="AI Code Suggestion (Ctrl+Space)">
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
                <Button variant="ghost" size="icon" onClick={onCommandPalette} title="Command Palette (Ctrl+Shift+P)">
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
            <Button size="icon" onClick={handleRun} className="bg-accent text-accent-foreground hover:bg-accent/90" title="Run Code">
              <Play className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Run Code</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
