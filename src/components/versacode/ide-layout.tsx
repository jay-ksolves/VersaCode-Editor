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
import { useFileSystem } from "@/hooks/useFileSystem";
import { TooltipProvider } from "../ui/tooltip";

type ActivePanel = "files" | "extensions" | "settings" | "tasks" | "none";

export function IdeLayout() {
  const [activePanel, setActivePanel] = useState<ActivePanel>("files");
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  const {
    files,
    activeFile,
    activeFileId,
    setActiveFileId,
    updateFileContent,
    createFile,
    createFolder,
    renameNode,
    deleteNode,
    getTargetFolder,
    expandedFolders,
    toggleFolder,
  } = useFileSystem();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleRun = useCallback(() => {
    if (activeFile) {
      setTerminalOutput((prev) => [
        ...prev,
        `> Executing ${activeFile.name}...`,
        `> Simulating output:`,
        ...activeFile.content.split('\n'),
        `> Execution finished.`
      ]);
    } else {
      setTerminalOutput((prev) => [...prev, `> No file selected to run.`]);
    }
  }, [activeFile]);

  const handleSuggest = useCallback(async () => {
    if (!activeFile) {
      toast({
        variant: "destructive",
        title: "No active file",
        description: "Please select a file to get suggestions.",
      });
      return;
    }

    setIsSuggesting(true);
    try {
      const result = await suggestCodeCompletion({
        codeContext: activeFile.content,
        programmingLanguage: "typescript", // This could be dynamic later
      });
      updateFileContent(activeFile.id, activeFile.content + result.suggestedCode);
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
  }, [activeFile, toast, updateFileContent]);
  
  const handleCodeChange = (newCode: string) => {
    if (activeFileId) {
      updateFileContent(activeFileId, newCode);
    }
  };

  const renderPanel = () => {
    switch (activePanel) {
      case "files":
        return <FileExplorer 
          files={files} 
          activeFileId={activeFileId} 
          onSelectFile={setActiveFileId}
          onCreateFile={createFile}
          onCreateFolder={createFolder}
          onRename={renameNode}
          onDeleteNode={deleteNode}
          getTargetFolder={getTargetFolder}
          expandedFolders={expandedFolders}
          onToggleFolder={toggleFolder}
        />;
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
    // Prevent hydration mismatch by not rendering server-side
    // This is important because useFileSystem relies on localStorage
    return null;
  }

  return (
    <TooltipProvider>
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
                <CodeEditor 
                  value={activeFile?.content} 
                  onChange={handleCodeChange}
                  isReadOnly={!activeFileId}
                />
              </div>
              <div className="h-1/3 border-t border-border flex flex-col">
                <Terminal output={terminalOutput} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
