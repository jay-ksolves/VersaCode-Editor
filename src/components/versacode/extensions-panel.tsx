import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Puzzle, CheckCircle } from "lucide-react";
import { extensions } from '@/lib/extensions';
import Link from "next/link";

export function ExtensionsPanel() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 space-y-2 border-b">
        <h2 className="text-lg font-semibold tracking-tight">Extensions</h2>
        <Input placeholder="Search extensions..." />
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Installed</h3>
        <div className="space-y-4">
          {extensions.map((ext) => (
            <div key={ext.id} className="flex items-start space-x-4">
              <div className="bg-muted p-2 rounded-lg">
                <Puzzle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{ext.name}</p>
                <p className="text-sm text-muted-foreground">{ext.description}</p>
                 <p className="text-xs text-muted-foreground mt-1">Version: {ext.version}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          ))}
        </div>
      </div>
       <div className="p-4 border-t">
        <Button className="w-full bg-accent hover:bg-accent/90" asChild>
          <Link href="/extensions">Browse Marketplace</Link>
        </Button>
      </div>
    </div>
  );
}
