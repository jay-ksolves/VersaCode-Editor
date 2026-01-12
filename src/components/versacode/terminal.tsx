
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, XCircle, Trash2, X, Split, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import type { Problem } from "./ide-layout";
import { cn } from "@/lib/utils";

interface TerminalProps {
  problems: Problem[];
  onGoToProblem: (problem: Problem) => void;
  onClosePanel: () => void;
  onNewTerminal: () => string;
  initialTerminals: TerminalSession[];
  onCloseTerminal: (id: string) => void;
  activeTerminalId: string | null;
  setActiveTerminalId: (id: string) => void;
}

export type TerminalSession = {
    id: string;
    name: string;
    output: React.ReactNode[];
    history: string[];
};


const TerminalInstance = ({ session }: { session: TerminalSession }) => {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [lines, setLines] = useState<React.ReactNode[]>(session.output);
    const [history, setHistory] = useState<string[]>(session.history);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const inputRef = useRef<HTMLSpanElement>(null);

    const scrollToBottom = useCallback(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, []);

    useEffect(scrollToBottom, [lines, scrollToBottom]);

    const executeCommand = (command: string) => {
        if (!command.trim()) {
            return createNewInputLine();
        }

        let resultNode: React.ReactNode;
        try {
            const result = eval(command);
            resultNode = <div className="text-muted-foreground whitespace-pre-wrap">{`<- ${JSON.stringify(result, null, 2)}`}</div>;
        } catch (error: any) {
            resultNode = <div className="text-destructive whitespace-pre-wrap">{error.toString()}</div>;
        }

        setHistory(prev => {
            const newHistory = [command, ...prev].slice(0, 50);
            session.history = newHistory;
            return newHistory;
        });
        setHistoryIndex(-1);
        
        const newOutput = (
            <React.Fragment>
                {resultNode}
                {createNewInputLine()}
            </React.Fragment>
        );
        session.output.push(resultNode, createNewInputLine());
        return newOutput;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
        const input = e.currentTarget.textContent || '';
        if (e.key === 'Enter') {
            e.preventDefault();
            e.currentTarget.contentEditable = 'false';
            session.output[session.output.length - 1] = <div className="flex items-center" key={`line-${Date.now()}`}><span className="text-green-400">versa-code {'>'}</span><span className="flex-1 ml-2">{input}</span></div>
            setLines(prev => [...prev, executeCommand(input)]);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (history.length > 0) {
                const newIndex = Math.min(history.length - 1, historyIndex + 1);
                setHistoryIndex(newIndex);
                e.currentTarget.textContent = history[newIndex] || '';
                 setTimeout(() => {
                    const range = document.createRange();
                    const sel = window.getSelection();
                    if (inputRef.current?.childNodes.length) {
                       range.setStart(inputRef.current.childNodes[0], e.currentTarget.textContent?.length ?? 0);
                       range.collapse(true);
                       sel?.removeAllRanges();
                       sel?.addRange(range);
                    }
                }, 0);
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
         <div className="flex items-center" key={`line-${Date.now()}-${Math.random()}`}>
            <span className="text-green-400">versa-code {'>'}</span>
            <span
                ref={inputRef}
                className="flex-1 ml-2 bg-transparent outline-none"
                contentEditable="true"
                autoFocus
                onKeyDown={handleKeyDown}
                suppressContentEditableWarning
            ></span>
        </div>
    );
     useEffect(() => {
        if (session.output.length === 0) {
             const welcomeMessage = (
                <div className="whitespace-pre-wrap">
                    Welcome to the VersaCode client-side terminal! You can run JavaScript code here.
                </div>
            );
            const initialLine = createNewInputLine();
            setLines([welcomeMessage, initialLine]);
            session.output = [welcomeMessage, initialLine];
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <ScrollArea className="h-full" ref={scrollAreaRef} onClick={() => inputRef.current?.focus()}>
            <div className="p-4">
                {lines.map((line, index) => (
                    <React.Fragment key={index}>
                        {line}
                    </React.Fragment>
                ))}
            </div>
        </ScrollArea>
    );
}

export function Terminal({ 
    problems, 
    onGoToProblem, 
    onClosePanel,
    onNewTerminal,
    initialTerminals,
    onCloseTerminal,
    activeTerminalId,
    setActiveTerminalId,
}: TerminalProps) {
  
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
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onNewTerminal} title="New Terminal">
                <Plus className="h-4 w-4"/>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>New Terminal</p>
            </TooltipContent>
          </Tooltip>
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
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => activeTerminalId && onCloseTerminal(activeTerminalId)} title="Kill Terminal">
                <Trash2 className="h-4 w-4"/>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Kill Terminal</p>
            </TooltipContent>
          </Tooltip>
           <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClosePanel} title="Hide Panel">
                <ChevronDown className="h-4 w-4"/>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Hide Panel</p>
            </TooltipContent>
          </Tooltip>
           <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClosePanel} title="Close Panel">
                <X className="h-4 w-4"/>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Close Panel</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="flex-1 bg-card font-code text-sm overflow-hidden">
        <TabsContent value="terminal" className="h-full m-0 flex flex-col">
          {initialTerminals.length > 0 && (
            <Tabs value={activeTerminalId ?? ''} onValueChange={setActiveTerminalId} className="border-b">
                <TabsList className="bg-transparent p-0 rounded-none h-auto">
                    {initialTerminals.map((term, i) => (
                        <TabsTrigger key={term.id} value={term.id} className="text-xs rounded-none border-r data-[state=active]:bg-background/20 data-[state=active]:shadow-none py-1.5 px-3 relative group">
                           {i+1}: {term.name}
                           <div role="button" onClick={(e) => { e.stopPropagation(); onCloseTerminal(term.id)}} className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-muted/50 cursor-pointer"><X className="h-3 w-3"/></div>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
          )}
           {initialTerminals.map(term => (
            <div key={term.id} className={cn("flex-1", activeTerminalId !== term.id && "hidden")}>
                <TerminalInstance session={term} />
            </div>
           ))}
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
                 <p className="text-sm text-muted-foreground text-center pt-4">No output yet.</p>
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
