"use client";

import React, { useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TerminalProps {
  output: string[];
}

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
