
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";


export function SearchPanel() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 space-y-2 border-b">
        <h2 className="text-lg font-semibold tracking-tight">Search</h2>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search all files..." className="pl-9" />
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-sm text-muted-foreground text-center pt-4">Enter a search query to find results across your workspace.</p>
      </div>
    </div>
  );
}

    