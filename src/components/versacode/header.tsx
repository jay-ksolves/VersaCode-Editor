import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Sparkles, LoaderCircle, Code, CaseSensitive } from "lucide-react";

interface HeaderProps {
  onRun: () => void;
  onSuggest: () => void;
  isSuggesting: boolean;
  onFormat: () => void;
  isFormatting: boolean;
}

export function Header({ onRun, onSuggest, isSuggesting, onFormat, isFormatting }: HeaderProps) {
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
        <Button variant="outline" onClick={onFormat} disabled={isFormatting}>
          {isFormatting ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <CaseSensitive />
          )}
          Format
        </Button>
        <Button variant="outline" onClick={onSuggest} disabled={isSuggesting}>
          {isSuggesting ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Sparkles />
          )}
          Suggest
        </Button>
        <Button onClick={onRun} className="bg-accent hover:bg-accent/90">
          <Play />
          Run
        </Button>
      </div>
    </header>
  );
}
