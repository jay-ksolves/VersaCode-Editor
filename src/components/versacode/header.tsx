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
import { Play, Sparkles, LoaderCircle, Indent } from "lucide-react";

interface HeaderProps {
  onRun: () => void;
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
}

export function Header({
  onRun,
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
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between h-16 px-4 border-b bg-card">
      <div className="flex items-center gap-4">
        <Menubar className="border-none bg-transparent">
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
              <MenubarItem onClick={onRun}>Run Code</MenubarItem>
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
            <Button size="icon" onClick={onRun} className="bg-accent text-accent-foreground hover:bg-accent/90" title="Run Code">
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
