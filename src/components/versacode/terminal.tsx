"use client";

import React, { useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, XCircle } from "lucide-react";

interface TerminalProps {
  output: string[];
}

const problems = [
  { severity: "error", message: "Property 'lenght' does not exist on type 'string[]'. Did you mean 'length'?", file: "src/app.tsx", line: 15 },
  { severity: "warning", message: "'Button' is declared but its value is never read.", file: "src/components/card.tsx", line: 8 },
  { severity: "error", message: "Cannot find name 'React'.", file: "src/lib/utils.ts", line: 2 },
];


export function Terminal({ output }: TerminalProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [output]);

  return (
    <Tabs defaultValue="terminal" className="h-full flex flex-col">
      <TabsList className="px-2 bg-card rounded-none border-b justify-start">
        <TabsTrigger value="terminal">TERMINAL</TabsTrigger>
        <TabsTrigger value="problems">PROBLEMS</TabsTrigger>
        <TabsTrigger value="output">OUTPUT</TabsTrigger>
        <TabsTrigger value="debug">DEBUG CONSOLE</TabsTrigger>
      </TabsList>
      <div className="flex-1 bg-background font-code text-sm overflow-hidden">
        <TabsContent value="terminal" className="h-full m-0">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
                 <div className="p-4">
                    {output.map((line, index) => (
                    <div key={index} className="whitespace-pre-wrap">
                        {line}
                    </div>
                    ))}
                    <div className="flex items-center">
                        <span className="text-green-400">versa-code &gt;</span>
                        <span className="flex-1 ml-2 bg-transparent outline-none" contentEditable></span>
                    </div>
                </div>
            </ScrollArea>
        </TabsContent>
        <TabsContent value="problems" className="p-4 m-0 font-body">
            <h3 className="text-sm font-semibold mb-2">Problems ({problems.length})</h3>
            <div className="space-y-2">
              {problems.map((problem, index) => (
                <div key={index} className="flex items-start space-x-2 text-xs">
                  {problem.severity === 'error' ? (
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  )}
                  <div>
                    <p className="text-foreground">{problem.message}</p>
                    <p className="text-muted-foreground">{problem.file} (line {problem.line})</p>
                  </div>
                </div>
              ))}
            </div>
        </TabsContent>
        <TabsContent value="output" className="p-4 m-0">
          No output yet.
        </TabsContent>
         <TabsContent value="debug" className="p-4 m-0">
          Debug console is empty.
        </TabsContent>
      </div>
    </Tabs>
  );
}
