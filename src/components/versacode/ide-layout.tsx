
'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { CodeEditor } from "./code-editor";
import { EditorTabs } from "./editor-tabs";
import { Terminal, TerminalSession } from "./terminal";
import { FileExplorer, FileExplorerRef } from "./file-explorer";
import { ExtensionsPanel } from "./extensions-panel";
import { SettingsPanel } from "./settings-panel";
import { useToast } from "@/hooks/use-toast";
import { suggestCodeCompletion } from "@/ai/flows/ai-suggest-code-completion";
import { useFileSystem } from "@/hooks/useFileSystem";
import { TooltipProvider } from "../ui/tooltip";
import type * as monaco from 'monaco-editor';
import { Breadcrumbs } from "./breadcrumbs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { SearchPanel } from "./search-panel";
import { cn } from "@/lib/utils";
import { formatCode } from "@/ai/flows/format-code";
import { useHotkeys } from "react-hotkeys-hook";


type ActivePanel = "files" | "extensions" | "settings" | "search" | "none";
export type Problem = { severity: 'error' | 'warning'; message: string; file: string; line: number; };

const defaultEditorSettings = {
  minimap: true,
  fontSize: 14,
};

function createNewTerminalSession(): TerminalSession {
    const welcomeMessage = (
        <div className="whitespace-pre-wrap">
            Welcome to the VersaCode client-side terminal! You can run JavaScript code here.
        </div>
    );
     const createNewInputLine = () => (
         <div className="flex items-center" key={`line-${Date.now()}-${Math.random()}`}>
            <span className="text-green-400">versa-code {'>'}</span>
            <span
                className="flex-1 ml-2 bg-transparent outline-none"
                contentEditable="true"
                autoFocus
                suppressContentEditableWarning
            ></span>
        </div>
    );
    return {
        id: `term_${Date.now()}`,
        name: 'zsh',
        output: [welcomeMessage, createNewInputLine()],
        history: [],
    };
}


function IdeLayoutContent() {
  const [activePanel, setActivePanel] = useState<ActivePanel>("files");
  const [output, setOutput] = useState<string[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [isFormatting, setIsFormatting] = useState<boolean>(false);
  const [editorSettings, setEditorSettings] = useState(defaultEditorSettings);
  const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());
  const [bottomPanelSize, setBottomPanelSize] = useState(33);
  const [terminalSessions, setTerminalSessions] = useState<TerminalSession[]>([]);
  const [activeTerminalId, setActiveTerminalId] = useState<string | null>(null);
  
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
    closeAllFiles,
    closeOtherFiles,
    closeToTheRight,
    closeToTheLeft,
    reorderOpenTabs,
    findNodeById,
    findNodeByPath,
  } = useFileSystem();

  useHotkeys('ctrl+n, cmd+n', (e) => {
    e.preventDefault();
    handleNewFile();
  }, [files]);
  
  useHotkeys('ctrl+s, cmd+s', (e) => {
    e.preventDefault();
    toast({ title: "Save (Placeholder)", description: "Save functionality is not yet implemented."});
  }, []);

  useHotkeys('ctrl+alt+f, cmd+alt+f', (e) => {
    e.preventDefault();
    handleFormatCode();
  });
  
  const logToOutput = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setOutput(prev => [...prev, `[${timestamp}] ${message}`]);
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
  
  // Effect for managing model lifecycle (creation, disposal, content listeners)
  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco) return;

    const openFilesSet = new Set(openFileIds);
    const disposables = new Map<string, monaco.IDisposable>();

    // Create models for newly opened files and attach change listeners
    openFilesSet.forEach(fileId => {
      if (!modelsRef.current.has(fileId)) {
        const file = findNodeById(fileId, true); // Get original to set initial content
        if (file?.type === 'file') {
          const model = monaco.editor.createModel(
            file.content,
            getFileLanguage(file.name),
            monaco.Uri.parse(`file:///${file.path}`)
          );

          // Listen for content changes to update both the main state and the dirty state
          const disposable = model.onDidChangeContent(() => {
            const currentContent = model.getValue();
            const originalContent = findNodeById(fileId, true)?.content;
            
            // Sync content with the main (React) state
            updateFileContent(fileId, currentContent, true);
            
            // Update dirty status
            setDirtyFiles(prev => {
              const newDirty = new Set(prev);
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

    // Clean up models and listeners for closed files
    modelsRef.current.forEach((model, fileId) => {
      if (!openFilesSet.has(fileId)) {
        disposables.get(fileId)?.dispose();
        model.dispose();
        modelsRef.current.delete(fileId);
        setDirtyFiles(prev => {
          const newDirty = new Set(prev);
          newDirty.delete(fileId);
          return newDirty;
        });
      }
    });

    return () => {
      // Dispose all remaining listeners on unmount
      disposables.forEach(d => d.dispose());
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

  // Effect for tracking editor diagnostics (problems)
  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco) return;

    const onMarkerChange = () => {
      const allProblems: Problem[] = [];
      const models = monaco.editor.getModels();
      
      models.forEach(model => {
        const markers = monaco.editor.getModelMarkers({ resource: model.uri });
        const filePath = model.uri.path.substring(1); // Remove leading '/'

        markers.forEach(marker => {
          if (marker.severity === monaco.MarkerSeverity.Error || marker.severity === monaco.MarkerSeverity.Warning) {
            allProblems.push({
              severity: marker.severity === monaco.MarkerSeverity.Error ? 'error' : 'warning',
              message: marker.message,
              file: filePath,
              line: marker.startLineNumber,
            });
          }
        });
      });
      setProblems(allProblems);
    };

    const disposable = monaco.editor.onDidChangeMarkers(onMarkerChange);
    onMarkerChange(); // Initial check

    return () => {
      disposable.dispose();
    };
  }, [openFileIds]);


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

  const handleSuggest = useCallback(async () => {
    if (!activeFile || !editorRef.current) {
      toast({
        variant: "destructive",
        title: "No active file",
        description: "Please select a file to get suggestions.",
      });
      return;
    }

    logToOutput(`Requesting AI code suggestion for ${activeFile.path}...`);
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

      logToOutput(`AI suggestion applied to ${activeFile.path}.`);
      toast({
        title: "AI Suggestion",
        description: "Code suggestion has been added.",
      });
    } catch (error) {
      logToOutput(`Error getting AI suggestion: ${error}`);
      console.error("AI suggestion failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get AI suggestion.",
      });
    } finally {
      setIsSuggesting(false);
    }
  }, [activeFile, toast, logToOutput]);

  const handleFormatCode = useCallback(async () => {
    if (!activeFile || !editorRef.current) {
      toast({
        variant: "destructive",
        title: "No active file",
        description: "Please select a file to format.",
      });
      return;
    }

    logToOutput(`Formatting ${activeFile.path}...`);
    setIsFormatting(true);
    try {
      const currentModel = editorRef.current.getModel();
      if (!currentModel) return;
      
      const result = await formatCode({
        code: currentModel.getValue(),
        language: getFileLanguage(activeFile.name),
      });

      const fullRange = currentModel.getFullModelRange();
      const op = { range: fullRange, text: result.formattedCode };
      currentModel.pushEditOperations([], [op], () => null);
      
      logToOutput(`${activeFile.path} formatted successfully.`);
      toast({
        title: "Code Formatted",
        description: `${activeFile.name} has been formatted.`,
      });

    } catch(error) {
       logToOutput(`Error formatting code: ${error}`);
       console.error("AI formatting failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to format code.",
      });
    } finally {
      setIsFormatting(false);
    }
  }, [activeFile, toast, logToOutput]);
  
  const handleSettingsChange = (newSettings: Partial<typeof editorSettings>) => {
    setEditorSettings(prev => ({...prev, ...newSettings}));
  };

  const handleResetSettings = () => {
    setEditorSettings(defaultEditorSettings);
    toast({
      title: "Settings Reset",
      description: "Editor settings have been reset to their defaults."
    });
  };
  
  const handleNewFile = () => fileExplorerRef.current?.startCreate('create_file');
  const handleNewFolder = () => fileExplorerRef.current?.startCreate('create_folder');
  
  const handleNewTerminal = useCallback(() => {
    if (bottomPanelSize <= 5) {
      setBottomPanelSize(33); // Or a default size
    }
    const newSession = createNewTerminalSession();
    setTerminalSessions(prev => [...prev, newSession]);
    setActiveTerminalId(newSession.id);
    return newSession.id;
  }, [bottomPanelSize]);

  const handleCloseTerminal = useCallback((id: string) => {
    setTerminalSessions(prev => {
        const newSessions = prev.filter(s => s.id !== id);
        if (activeTerminalId === id) {
            setActiveTerminalId(newSessions[newSessions.length - 1]?.id ?? null);
        }
        return newSessions;
    });
  }, [activeTerminalId]);


  useEffect(() => {
    if (terminalSessions.length === 0) {
      const newId = handleNewTerminal();
      setActiveTerminalId(newId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleNewTerminal]);

  const handleToggleTerminal = () => {
    setBottomPanelSize(prev => prev > 5 ? 0 : 33);
  };


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

  const confirmClose = (fileIds: string[]): boolean => {
    const dirtyToClose = fileIds.filter(id => dirtyFiles.has(id));
    if (dirtyToClose.length === 0) return true;
    
    const fileNames = dirtyToClose.map(id => findNodeById(id)?.name).filter(Boolean).join(', ');
    return window.confirm(`You have unsaved changes in: ${fileNames}. Are you sure you want to close?`);
  }

  const handleCloseTab = (fileId: string) => {
    if (!confirmClose([fileId])) return;
    closeFileFromHook(fileId);
  }
  
  const handleCloseAllTabs = () => {
    if (!confirmClose(openFileIds)) return;
    closeAllFiles();
  }

  const handleCloseOtherTabs = (fileId: string) => {
    const otherFileIds = openFileIds.filter(id => id !== fileId);
    if (!confirmClose(otherFileIds)) return;
    closeOtherFiles(fileId);
  }
  
  const handleCloseToTheRight = (fileId: string) => {
    const fileIndex = openFileIds.indexOf(fileId);
    if (fileIndex === -1) return;
    const filesToTheRight = openFileIds.slice(fileIndex + 1);
    if (!confirmClose(filesToTheRight)) return;
    closeToTheRight(fileId);
  }

  const handleCloseToTheLeft = (fileId: string) => {
    const fileIndex = openFileIds.indexOf(fileId);
    if (fileIndex === -1) return;
    const filesToTheLeft = openFileIds.slice(0, fileIndex);
    if (!confirmClose(filesToTheLeft)) return;
    closeToTheLeft(fileId);
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
      case "search":
        return <SearchPanel />;
      case "extensions":
        return <ExtensionsPanel />;
      case "settings":
        return <SettingsPanel 
          settings={editorSettings} 
          onSettingsChange={handleSettingsChange}
          onResetSettings={handleResetSettings}
        />;
      default:
        return null;
    }
  };


  return (
      <div className="flex h-screen bg-background text-foreground font-body">
        <Sidebar activePanel={activePanel} onSelectPanel={setActivePanel} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            onSuggest={handleSuggest}
            onFormat={handleFormatCode}
            isSuggesting={isSuggesting}
            isFormatting={isFormatting}
            onNewFile={handleNewFile}
            onNewFolder={handleNewFolder}
            isMinimapVisible={editorSettings.minimap}
            onToggleMinimap={(checked) => handleSettingsChange({ minimap: checked })}
            onNewTerminal={handleNewTerminal}
            onToggleTerminal={handleToggleTerminal}
            logOutput={logToOutput}
          />
          <main className="flex-1 flex overflow-hidden">
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30} id="side-panel" order={1} className={cn("min-w-[200px]", activePanel === 'none' && "hidden")}>
                {renderPanel()}
              </ResizablePanel>
              {activePanel !== 'none' && <ResizableHandle withHandle />}
              <ResizablePanel id="main-panel" order={2}>
                 <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={100 - bottomPanelSize} order={1}>
                       <div className="flex-1 flex flex-col min-w-0 h-full">
                        <EditorTabs
                            openFileIds={openFileIds}
                            activeFileId={activeFileId}
                            onSelectTab={setActiveFileId}
                            onCloseTab={handleCloseTab}
                            onCloseAllTabs={handleCloseAllTabs}
                            onCloseOtherTabs={handleCloseOtherTabs}
                            onCloseToTheRight={handleCloseToTheRight}
                            onCloseToTheLeft={handleCloseToTheLeft}
                            onReorderTabs={reorderOpenTabs}
                            findNodeById={findNodeById}
                            dirtyFileIds={dirtyFiles}
                        />
                        <Breadcrumbs
                          activeFile={activeFile}
                          onSelectPath={handleBreadcrumbSelect}
                        />
                        <div className="flex-1 relative overflow-auto bg-card isolate z-0">
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
                      </div>
                    </ResizablePanel>
                    {bottomPanelSize > 5 && <ResizableHandle withHandle />}
                    <ResizablePanel 
                      defaultSize={bottomPanelSize} 
                      minSize={5} 
                      maxSize={80} 
                      id="bottom-panel" 
                      order={2}
                      onResize={setBottomPanelSize}
                      className={cn(bottomPanelSize <= 5 && "hidden")}
                    >
                      <Terminal 
                        problems={problems} 
                        onGoToProblem={handleGoToProblem} 
                        onClosePanel={() => setBottomPanelSize(0)}
                        onNewTerminal={handleNewTerminal}
                        initialTerminals={terminalSessions}
                        onCloseTerminal={handleCloseTerminal}
                        activeTerminalId={activeTerminalId}
                        setActiveTerminalId={setActiveTerminalId}
                      />
                    </ResizablePanel>
                  </ResizablePanelGroup>
              </ResizablePanel>
            </ResizablePanelGroup>
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
