
'use client';

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SearchResult } from "@/hooks/useFileSystem";
import { FileIconComponent } from "./file-explorer";

interface SearchPanelProps {
    onSearch: (query: string) => SearchResult[];
    onGoToResult: (result: SearchResult) => void;
}

export function SearchPanel({ onSearch, onGoToResult }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (newQuery.length > 2) {
      const searchResults = onSearch(newQuery);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  };

  const groupedResults = useMemo(() => {
    return results.reduce((acc, result) => {
        if (!acc[result.filePath]) {
            acc[result.filePath] = [];
        }
        acc[result.filePath].push(result);
        return acc;
    }, {} as Record<string, SearchResult[]>);
  }, [results]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 space-y-2 border-b">
        <h2 className="text-lg font-semibold tracking-tight">Search</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search all files..." 
            className="pl-9"
            value={query}
            onChange={handleSearch}
          />
        </div>
        {query && <p className="text-xs text-muted-foreground">{results.length} results found.</p>}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
            {query.length > 2 ? (
                Object.entries(groupedResults).length > 0 ? (
                    <div className="space-y-4">
                        {Object.entries(groupedResults).map(([filePath, fileResults]) => (
                            <div key={filePath}>
                                <div className="flex items-center gap-2 mb-2">
                                    <FileIconComponent filename={filePath} />
                                    <h3 className="font-semibold text-sm truncate" title={filePath}>{filePath}</h3>
                                </div>
                                <div className="space-y-1 pl-6">
                                    {fileResults.map((result, index) => (
                                        <div 
                                            key={`${result.fileId}-${result.line}-${index}`}
                                            className="text-xs text-muted-foreground cursor-pointer p-1 rounded-md hover:bg-muted"
                                            onClick={() => onGoToResult(result)}
                                            title={`Go to line ${result.line}`}
                                        >
                                            <span className="font-mono text-foreground/70 mr-2">{result.line}:</span>
                                            <span 
                                                dangerouslySetInnerHTML={{
                                                    __html: result.lineContent.replace(
                                                        new RegExp(`(${query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'),
                                                        `<span class="bg-yellow-500/30 text-foreground rounded-sm px-0.5">\$1</span>`
                                                    )
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center pt-4">No results found for '{query}'.</p>
                )
            ) : (
                <p className="text-sm text-muted-foreground text-center pt-4">Enter a search query (min 3 chars) to find results.</p>
            )}
        </div>
      </ScrollArea>
    </div>
  );
}
