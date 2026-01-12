
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";


export function SearchPanel() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 space-y-2 border-b">
        <h2 className="text-lg font-semibold tracking-tight">Search</h2>
        <div className="flex gap-2">
            <Input placeholder="Search all files..." />
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-sm text-muted-foreground text-center">Enter a search query to find results across your workspace.</p>
      </div>
       <div className="p-4 border-t">
        <Button className="w-full">
            <Search className="mr-2 h-4 w-4"/>
            Search
        </Button>
      </div>
    </div>
  );
}

    