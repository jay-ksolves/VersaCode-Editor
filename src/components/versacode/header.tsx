import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, Sparkles, LoaderCircle, Code } from "lucide-react";

interface HeaderProps {
  onRun: () => void;
  onSuggest: () => void;
  isSuggesting: boolean;
}

export function Header({ onRun, onSuggest, isSuggesting }: HeaderProps) {
  return (
    <header className="flex items-center justify-between h-16 px-4 border-b bg-card">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Code className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">VersaCode</h1>
        </div>
        <Select defaultValue="nodejs">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nodejs">Node.js</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="go">Go</SelectItem>
            <SelectItem value="web">Web (HTML/CSS/JS)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onSuggest} disabled={isSuggesting} title="AI Code Suggestion">
              {isSuggesting ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>AI Code Suggestion</p>
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
