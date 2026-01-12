
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { CodeEditor } from "./code-editor";
import { EditorTabs } from "./editor-tabs";
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

function IdeLayoutContent() {
  const [activePanel, setActivePanel] = useState<ActivePanel>("files");
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
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
    openFile,
    openFileIds,
    closeFile,
    findNodeById,
  } = useFileSystem();
  
  const clearTerminal = useCallback(() => {
    setTerminalOutput([]);
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
        programmingLanguage: "typescript", 
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
  
  const handleCodeChange = (newCode: string | undefined) => {
    if (activeFileId && newCode !== undefined) {
      updateFileContent(activeFileId, newCode);
    }
  };

  const renderPanel = () => {
    switch (activePanel) {
      case "files":
        return <FileExplorer 
          files={files} 
          activeFileId={activeFileId} 
          onSelectFile={openFile}
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

  const getFileLanguage = (filename: string) => {
    const extension = filename.split('.').pop();
    switch (extension) {
      case 'js':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      default:
        return 'plaintext';
    }
  };


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
              <EditorTabs
                  openFileIds={openFileIds}
                  activeFileId={activeFileId}
                  onSelectTab={setActiveFileId}
                  onCloseTab={closeFile}
                  findNodeById={findNodeById}
              />
              <div className="flex-1 relative overflow-auto bg-card">
                 {openFileIds.length > 0 && activeFile ? (
                    <CodeEditor 
                      key={activeFileId}
                      value={activeFile.content} 
                      onChange={handleCodeChange}
                      isReadOnly={!activeFileId}
                      language={getFileLanguage(activeFile.name)}
                    />
                 ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Select a file to begin editing or create a new one.</p>
                  </div>
                 )}
              </div>
              <div className="h-1/3 border-t border-border flex flex-col">
                <Terminal output={terminalOutput} onClear={clearTerminal} />
              </div>
            </div>
          </main>
        </div>
      </div>
  );
}

export function IdeLayout() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; 
  }
  
  return (
    <TooltipProvider>
      <IdeLayoutContent />
    </TooltipProvider>
  );
}
