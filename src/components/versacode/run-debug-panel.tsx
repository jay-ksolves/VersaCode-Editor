
'use client';

import { Bug, Play, Pause, RefreshCw, StepOver, ArrowDownToLine } from "lucide-react";
import { Button } from "../ui/button";

export function RunDebugPanel() {
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold tracking-tight">Run and Debug</h2>
                    <Button size="sm">
                        <Play className="mr-2 h-4 w-4" />
                        Run
                    </Button>
                </div>
                <div className="flex items-center justify-center gap-2 bg-muted p-1 rounded-md">
                     <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                        <Play className="h-4 w-4" />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                        <Pause className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                        <StepOver className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                        <ArrowDownToLine className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                        <ArrowDownToLine className="h-4 w-4 rotate-180" />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
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
