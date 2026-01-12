
'use client';

import { GitBranch, Plus, Check, MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function SourceControlPanel() {
    const stagedChanges = [
        { name: "src/components/versacode/ide-layout.tsx", status: "M" },
        { name: "src/hooks/useFileSystem.ts", status: "M" },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">Source Control</h2>
                <div className="flex items-center gap-1">
                     <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="p-4 space-y-2">
                <Input placeholder="Commit message" disabled/>
                <Button className="w-full" disabled>Commit</Button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto border-t">
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Staged Changes ({stagedChanges.length})</h3>
                <div className="space-y-2">
                    {stagedChanges.map(change => (
                         <div key={change.name} className="flex items-center justify-between text-sm p-1 rounded-md hover:bg-muted">
                            <span className="truncate" title={change.name}>{change.name}</span>
                            <span className="font-mono text-yellow-500">{change.status}</span>
                        </div>
                    ))}
                </div>

                 <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-10">
                    <GitBranch className="w-16 h-16 mb-4" />
                    <p className="text-sm">Git integration is not yet available.</p>
                    <p className="text-xs mt-1">This is a placeholder UI for source control.</p>
                </div>
            </div>
        </div>
    );
}
