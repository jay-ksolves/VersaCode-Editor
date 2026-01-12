
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, XCircle, Trash2, X, Split } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import type { Problem } from "./ide-layout";

interface TerminalProps {
  output: string[];
  problems: Problem[];
  onGoToProblem: (problem: Problem) => void;
  onClose: () => void;
}

export function Terminal({ output: initialOutput, problems, onGoToProblem, onClose }: TerminalProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [terminalLines, setTerminalLines] = useState<React.ReactNode[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const scrollToBottom = () => {
     if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }

  useEffect(() => {
    const welcomeMessage = (
      <div className="whitespace-pre-wrap">
        Welcome to the VersaCode client-side terminal! You can run JavaScript code here.
      </div>
    );
    setTerminalLines([welcomeMessage, createNewInputLine()]);
  }, []);

  useEffect(scrollToBottom, [terminalLines]);

  const executeCommand = (command: string) => {
    if (!command.trim()) {
        return createNewInputLine();
    }

    let resultNode: React.ReactNode;
    try {
        // Using eval can be risky, but for a client-side toy terminal it's acceptable.
        // A safer alternative would be to use a library like `jailed`.
        const result = eval(command);
        resultNode = <div className="text-muted-foreground whitespace-pre-wrap">{`<- ${JSON.stringify(result, null, 2)}`}</div>;
    } catch (error: any) {
        resultNode = <div className="text-destructive whitespace-pre-wrap">{error.toString()}</div>;
    }

    setHistory(prev => [command, ...prev].slice(0, 50));
    setHistoryIndex(-1);

    return (
        <>
            {resultNode}
            {createNewInputLine()}
        </>
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    const input = e.currentTarget.textContent || '';
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.contentEditable = 'false';
      setTerminalLines(prev => [...prev, executeCommand(input)]);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (history.length > 0) {
            const newIndex = Math.min(history.length - 1, historyIndex + 1);
            setHistoryIndex(newIndex);
            e.currentTarget.textContent = history[newIndex] || '';
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex >= 0) {
            const newIndex = Math.max(-1, historyIndex - 1);
            setHistoryIndex(newIndex);
            e.currentTarget.textContent = newIndex === -1 ? '' : history[newIndex] || '';
        }
    }
  };

  const createNewInputLine = () => (
     <div className="flex items-center" key={`line-${Date.now()}`}>
        <span className="text-green-400">versa-code {'>'}</span>
        <span
            className="flex-1 ml-2 bg-transparent outline-none"
            contentEditable="true"
            autoFocus
            onKeyDown={handleKeyDown}
            suppressContentEditableWarning
        ></span>
    </div>
  );

  const handleClearTerminal = () => {
    setTerminalLines([createNewInputLine()]);
  }

  const handleClearOutput = () => {
    // This is handled in the parent component, but we can provide a dummy implementation if needed
  }

  return (
    <Tabs defaultValue="terminal" className="h-full flex flex-col">
      <div className="flex items-center justify-between border-b pr-2 bg-card">
        <TabsList className="px-2 bg-transparent rounded-none border-b-0 justify-start">
          <TabsTrigger value="terminal">TERMINAL</TabsTrigger>
          <TabsTrigger value="problems">PROBLEMS</TabsTrigger>
          <TabsTrigger value="output">OUTPUT</TabsTrigger>
          <TabsTrigger value="debug">DEBUG CONSOLE</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-1">
           <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Split Terminal" disabled>
                <Split className="h-4 w-4"/>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Split Terminal</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClearTerminal} title="Clear Terminal">
                <Trash2 className="h-4 w-4"/>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Clear</p>
            </TooltipContent>
          </Tooltip>
           <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} title="Close Panel">
                <X className="h-4 w-4"/>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Close Panel</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="flex-1 bg-[#1e1e1e] font-code text-sm overflow-hidden">
        <TabsContent value="terminal" className="h-full m-0">
            <ScrollArea className="h-full" ref={scrollAreaRef} onClick={() => {
                const lastLine = scrollAreaRef.current?.querySelector('span[contenteditable=true]') as HTMLSpanElement;
                lastLine?.focus();
            }}>
                 <div className="p-4">
                    {terminalLines}
                </div>
            </ScrollArea>
        </TabsContent>
        <TabsContent value="problems" className="h-full m-0 font-body">
            <ScrollArea className="h-full">
              <div className="p-4">
                <h3 className="text-sm font-semibold mb-2">Problems ({problems.length})</h3>
                {problems.length > 0 ? (
                  <div className="space-y-2">
                    {problems.map((problem, index) => (
                      <div key={index} className="flex items-start space-x-2 text-xs cursor-pointer hover:bg-muted p-1 rounded-md" onClick={() => onGoToProblem(problem)} title={`Go to ${problem.file}, line ${problem.line}`}>
                        {problem.severity === 'error' ? (
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-foreground">{problem.message}</p>
                          <p className="text-muted-foreground">{problem.file} ({problem.line})</p>

                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center pt-4">No problems have been detected in the workspace.</p>
                )}
              </div>
            </ScrollArea>
        </TabsContent>
        <TabsContent value="output" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4 whitespace-pre-wrap">
                {initialOutput.length > 0 ? initialOutput.join('\n') : <p className="text-sm text-muted-foreground text-center pt-4">No output yet.</p>}
              </div>
            </ScrollArea>
        </TabsContent>
         <TabsContent value="debug" className="p-4 m-0">
          <p className="text-sm text-muted-foreground text-center pt-4">Debug console is not yet implemented.</p>
        </TabsContent>
      </div>
    </Tabs>
  );
}

    