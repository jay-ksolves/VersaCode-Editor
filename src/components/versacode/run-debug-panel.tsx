
'use client';

import { Bug, Play, Pause, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";

export function RunDebugPanel() {
    const { toast } = useToast();

    const handleAction = (action: string) => {
        toast({
            title: "Action Triggered (Placeholder)",
            description: `The "${action}" action is for demonstration and is not yet implemented.`
        });
    };

    return (
        <div className="h-full flex flex-col" data-testid="run-debug-panel">
            <div className="p-4 border-b flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold tracking-tight">Run and Debug</h2>
                    <Button size="sm" onClick={() => handleAction('Run and Debug')} data-testid="run-debug-start-button">
                        <Play className="mr-2 h-4 w-4" />
                        Run
                    </Button>
                </div>
                <div className="flex items-center justify-center gap-2 bg-muted p-1 rounded-md">
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAction('Continue')} data-testid="run-debug-continue-button">
                        <Play className="h-4 w-4" />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAction('Pause')} data-testid="run-debug-pause-button">
                        <Pause className="h-4 w-4" />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAction('Restart')} data-testid="run-debug-restart-button">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Bug className="w-16 h-16 mb-4" />
                    <p className="text-sm">The debugger is not yet connected.</p>
                    <p className="text-xs mt-1">Click "Run" to start a debugging session.</p>
                </div>
            </div>
        </div>
    );
}
