"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { CodeEditor } from "./code-editor";
import { Terminal } from "./terminal";
import { FileExplorer } from "./file-explorer";
import { ExtensionsPanel } from "./extensions-panel";
import { SettingsPanel } from "./settings-panel";
import { TasksPanel } from "./tasks-panel";
import { useToast } from "@/hooks/use-toast";
import { suggestCodeCompletion } from "@/ai/flows/ai-suggest-code-completion";

type ActivePanel = "files" | "extensions" | "settings" | "tasks" | "none";

const initialCode = `function greet(name) {\n  console.log(\`Hello, \${name}!\`);\n}\n\ngreet('VersaCode');`;

export function IdeLayout() {
  const [activePanel, setActivePanel] = useState<ActivePanel>("files");
  const [code, setCode] = useState<string>(initialCode);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleRun = useCallback(() => {
    setTerminalOutput((prev) => [
      ...prev,
      `> Executing code...`,
      ...code.split("\n"),
      `> Execution finished.`,
    ]);
  }, [code]);

  const handleSuggest = useCallback(async () => {
    setIsSuggesting(true);
    try {
      const result = await suggestCodeCompletion({
        codeContext: code,
        programmingLanguage: "typescript",
      });
      setCode((prev) => prev + result.suggestedCode);
      toast({
        title: "AI Suggestion",
        description: "Code suggestion has been added.",
      });
    } catch (error) {
      console.error("AI suggestion failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get AI suggestion.",
      });
    } finally {
      setIsSuggesting(false);
    }
  }, [code, toast]);

  const renderPanel = () => {
    switch (activePanel) {
      case "files":
        return <FileExplorer />;
      case "extensions":
        return <ExtensionsPanel />;
      case "settings":
        return <SettingsPanel />;
      case "tasks":
        return <TasksPanel />;
      default:
        return null;
    }
  };

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex h-screen bg-background text-foreground font-body">
      <Sidebar activePanel={activePanel} onSelectPanel={setActivePanel} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onRun={handleRun} onSuggest={handleSuggest} isSuggesting={isSuggesting} />
        <main className="flex-1 flex overflow-hidden">
          {activePanel !== "none" && (
            <div className="w-64 bg-card border-r border-border flex-shrink-0 overflow-y-auto">
              {renderPanel()}
            </div>
          )}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 relative overflow-auto">
              <CodeEditor value={code} onChange={setCode} />
            </div>
            <div className="h-1/3 border-t border-border flex flex-col">
              <Terminal output={terminalOutput} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
