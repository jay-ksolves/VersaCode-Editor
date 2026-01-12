
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { CodeEditor } from "./code-editor";
import { EditorTabs } from "./editor-tabs";
import { Terminal } from "./terminal";
import { FileExplorer, FileExplorerRef } from "./file-explorer";
import { ExtensionsPanel } from "./extensions-panel";
import { SettingsPanel } from "./settings-panel";
import { TasksPanel } from "./tasks-panel";
import { useToast } from "@/hooks/use-toast";
import { suggestCodeCompletion } from "@/ai/flows/ai-suggest-code-completion";
import { useFileSystem } from "@/hooks/useFileSystem";
import { TooltipProvider } from "../ui/tooltip";
import type * as monaco from 'monaco-editor';
import { Breadcrumbs } from "./breadcrumbs";


type ActivePanel = "files" | "extensions" | "settings" | "tasks" | "none";
type Problem = { severity: 'error' | 'warning'; message: string; file: string; line: number; };

const mockProblems: Problem[] = [
  { severity: "error", message: "Property 'lenght' does not exist on type 'string[]'. Did you mean 'length'?", file: "src/app.tsx", line: 2 },
  { severity: "warning", message: "'Button' is declared but its value is never read.", file: "src/styles.css", line: 1 },
  { severity: "error", message: "Cannot find name 'React'.", file: "package.json", line: 1 },
];


const defaultEditorSettings = {
  minimap: true,
  fontSize: 14,
};

function IdeLayoutContent() {
  const [activePanel, setActivePanel] = useState<ActivePanel>("files");
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [editorSettings, setEditorSettings] = useState(defaultEditorSettings);
  const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());
  
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);
  const fileExplorerRef = useRef<FileExplorerRef>(null);
  const modelsRef = useRef<Map<string, monaco.editor.ITextModel>>(new Map());


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
    moveNode,
    getTargetFolder,
    expandedFolders,
    toggleFolder,
    openFile,
    openFileIds,
    closeFile: closeFileFromHook,
    findNodeById,
    findNodeByPath,
  } = useFileSystem();
  
  const clearTerminal = useCallback(() => {
    setTerminalOutput([]);
  }, []);
  
  const getFileLanguage = (filename: string | undefined) => {
    if (!filename) return 'plaintext';
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
      case 'html':
        return 'html';
      default:
        return 'plaintext';
    }
  };
  
  // Effect for managing model lifecycle (creation and disposal)
  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco) return;

    const openFilesSet = new Set(openFileIds);
    const disposables = new Map<string, monaco.IDisposable>();

    // Create models for newly opened files
    openFilesSet.forEach(fileId => {
      if (!modelsRef.current.has(fileId)) {
        const file = findNodeById(fileId);
        if (file?.type === 'file') {
          const model = monaco.editor.createModel(
            file.content,
            getFileLanguage(file.name),
            monaco.Uri.parse(`file:///${file.path}`)
          );

          // Listen for content changes to update both the main state and the dirty state
          const disposable = model.onDidChangeContent(() => {
            const currentContent = model.getValue();
            const savedContent = findNodeById(fileId)?.content;
            
            // Sync content with the main state
            if (currentContent !== savedContent) {
              updateFileContent(fileId, currentContent);
            }
            
            // Update dirty status
            setDirtyFiles(prev => {
              const newDirty = new Set(prev);
              const originalContent = findNodeById(fileId, true)?.content; // Get original from non-React state
              if (currentContent !== originalContent) {
                newDirty.add(fileId);
              } else {
                newDirty.delete(fileId);
              }
              return newDirty;
            });
          });
          
          disposables.set(fileId, disposable);
          modelsRef.current.set(fileId, model);
        }
      }
    });

    // Clean up models for closed files
    return () => {
        modelsRef.current.forEach((model, fileId) => {
            if (!openFilesSet.has(fileId)) {
                model.dispose();
                modelsRef.current.delete(fileId);
                disposables.get(fileId)?.dispose();
                disposables.delete(fileId);
                setDirtyFiles(prev => {
                  const newDirty = new Set(prev);
                  newDirty.delete(fileId);
                  return newDirty;
                });
            }
        });
    };

  }, [openFileIds, findNodeById, updateFileContent]);

  // Effect for switching the editor's active model
  useEffect(() => {
    const editor = editorRef.current;
    const model = activeFileId ? modelsRef.current.get(activeFileId) : null;
    
    if (editor && editor.getModel() !== model) {
      editor.setModel(model || null);
    }
  }, [activeFileId]);


  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;

    // Set the initial model if there's an active file on mount
    if (activeFileId) {
        const model = modelsRef.current.get(activeFileId);
        if (model) {
            editor.setModel(model);
        }
    }
  };
  
  const handleRun = useCallback(() => {
    if (activeFile) {
      setTerminalOutput((prev) => [
        ...prev,
        `> Executing ${activeFile.name}...`,
        `> Simulating output:`,
        ...(activeFile.content || '').split('\n'),
        `> Execution finished.`
      ]);
    } else {
      setTerminalOutput((prev) => [...prev, `> No file selected to run.`]);
    }
  }, [activeFile]);

  const handleSuggest = useCallback(async () => {
    if (!activeFile || !editorRef.current) {
      toast({
        variant: "destructive",
        title: "No active file",
        description: "Please select a file to get suggestions.",
      });
      return;
    }

    setIsSuggesting(true);
    try {
      const currentModel = editorRef.current.getModel();
      if (!currentModel) return;

      const result = await suggestCodeCompletion({
        codeContext: currentModel.getValue(),
        programmingLanguage: getFileLanguage(activeFile.name), 
      });

      // Apply the suggestion to the model
      const range = editorRef.current.getSelection() || new monaco.Range(1,1,1,1);
      const id = { major: 1, minor: 1 };
      const op = {identifier: id, range: range, text: result.suggestedCode, forceMoveMarkers: true};
      currentModel.pushEditOperations([], [op], () => null);

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
  }, [activeFile, toast]);
  
  const handleSettingsChange = (newSettings: Partial<typeof editorSettings>) => {
    setEditorSettings(prev => ({...prev, ...newSettings}));
  }

  const handleResetSettings = () => {
    setEditorSettings(defaultEditorSettings);
    toast({
      title: "Settings Reset",
      description: "Editor settings have been reset to their defaults."
    });
  };
  
  const handleNewFile = () => fileExplorerRef.current?.startCreate('create_file');
  const handleNewFolder = () => fileExplorerRef.current?.startCreate('create_folder');

  const handleGoToProblem = useCallback((problem: Problem) => {
    const targetNode = findNodeByPath(problem.file);
    if (targetNode && targetNode.type === 'file') {
      openFile(targetNode.id);
      
      setTimeout(() => {
        editorRef.current?.revealLineInCenter(problem.line, monaco.editor.ScrollType.Smooth);
        editorRef.current?.setPosition({ lineNumber: problem.line, column: 1 });
        editorRef.current?.focus();
      }, 100);
    } else {
      toast({
        variant: "destructive",
        title: "File not found",
        description: `Could not find the file: ${problem.file}`
      })
    }
  }, [findNodeByPath, openFile, toast]);

  const handleBreadcrumbSelect = (path: string) => {
    const node = findNodeByPath(path);
    if (node) {
      if (node.type === 'file') {
        openFile(node.id);
      } else if (node.type === 'folder') {
        toggleFolder(node.id, true);
      }
    }
  }

  const handleCloseTab = (fileId: string) => {
    if (dirtyFiles.has(fileId)) {
        if (!window.confirm("You have unsaved changes. Are you sure you want to close this file?")) {
            return;
        }
    }
    closeFileFromHook(fileId);
  }

  const renderPanel = () => {
    switch (activePanel) {
      case "files":
        return <FileExplorer 
          ref={fileExplorerRef}
          files={files} 
          activeFileId={activeFileId} 
          onSelectFile={openFile}
          createFile={createFile}
          createFolder={createFolder}
          renameNode={renameNode}
          deleteNode={deleteNode}
          moveNode={moveNode}
          getTargetFolder={getTargetFolder}
          expandedFolders={expandedFolders}
          onToggleFolder={toggleFolder}
          onOpenFile={openFile}
        />;
      case "extensions":
        return <ExtensionsPanel />;
      case "settings":
        return <SettingsPanel 
          settings={editorSettings} 
          onSettingsChange={handleSettingsChange}
          onResetSettings={handleResetSettings}
        />;
      case "tasks":
        return <TasksPanel />;
      default:
        return null;
    }
  };


  return (
      <div className="flex h-screen bg-background text-foreground font-body">
        <Sidebar activePanel={activePanel} onSelectPanel={setActivePanel} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            onRun={handleRun} 
            onSuggest={handleSuggest} 
            isSuggesting={isSuggesting}
            onNewFile={handleNewFile}
            onNewFolder={handleNewFolder}
            isMinimapVisible={editorSettings.minimap}
            onToggleMinimap={(checked) => handleSettingsChange({ minimap: checked })}
          />
          <main className="flex-1 flex overflow-hidden">
            {activePanel !== "none" && (
              <div className="w-64 bg-card border-r border-border flex-shrink-0 overflow-y-auto">
                {renderPanel()}
              </div>
            )}
            <div className="flex-1 flex flex-col min-w-0">
               <Breadcrumbs
                activeFile={activeFile}
                onSelectPath={handleBreadcrumbSelect}
              />
              <EditorTabs
                  openFileIds={openFileIds}
                  activeFileId={activeFileId}
                  onSelectTab={setActiveFileId}
                  onCloseTab={handleCloseTab}
                  findNodeById={findNodeById}
                  dirtyFileIds={dirtyFiles}
              />
              <div className="flex-1 relative overflow-auto bg-card">
                 {openFileIds.length > 0 && activeFile ? (
                    <CodeEditor 
                      onMount={handleEditorMount}
                      options={{ 
                        minimap: {enabled: editorSettings.minimap},
                        fontSize: editorSettings.fontSize,
                      }}
                    />
                 ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Select a file to begin editing or create a new one.</p>
                  </div>
                 )}
              </div>
              <div className="h-1/3 border-t border-border flex flex-col">
                <Terminal output={terminalOutput} problems={mockProblems} onClear={clearTerminal} onGoToProblem={handleGoToProblem} />
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
