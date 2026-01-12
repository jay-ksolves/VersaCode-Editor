
'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "./header";
import { CodeEditor } from "./code-editor";
import { EditorTabs } from "./editor-tabs";
import { Terminal, TerminalSession } from "./terminal";
import { FileExplorer, FileExplorerRef } from "./file-explorer";
import { ExtensionsPanel } from "./extensions-panel";
import { SettingsPanel } from "./settings-panel";
import { useToast } from "@/hooks/use-toast";
import { suggestCodeCompletion } from "@/ai/flows/ai-suggest-code-completion";
import { useFileSystem, SearchResult, FileSystemNode } from "@/hooks/useFileSystem";
import { TooltipProvider } from "../ui/tooltip";
import type * as monaco from 'monaco-editor';
import { Breadcrumbs } from "./breadcrumbs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { SearchPanel } from "./search-panel";
import { cn } from "@/lib/utils";
import { useHotkeys } from "react-hotkeys-hook";
import { ActivityBar, type ActivePanel } from "./activity-bar";
import { StatusBar } from "./status-bar";
import { CommandPalette } from "./command-palette";
import { AiAssistantPanel } from "./ai-assistant-panel";

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
  const [bottomPanelSize, setBottomPanelSize] = useState(25);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(true);
  const [terminalSessions, setTerminalSessions] = useState<TerminalSession[]>([]);
  const [activeTerminalId, setActiveTerminalId] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);
  const fileExplorerRef = useRef<FileExplorerRef>(null);
  const modelsRef = useRef<Map<string, monaco.editor.ITextModel>>(new Map());


  const { toast } = useToast();

  const {
    files,
    setFiles,
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
    setOpenFileIds,
    closeFile: closeFileFromHook,
    findNodeById,
    findNodeByPath,
    searchFiles,
    refreshFileSystem,
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
  
  useHotkeys('ctrl+shift+p, cmd+shift+p', (e) => {
    e.preventDefault();
    setIsCommandPaletteOpen(true);
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
  
  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco) return;

    const openFilesSet = new Set(openFileIds);
    const disposables = new Map<string, monaco.IDisposable>();

    openFilesSet.forEach(fileId => {
      if (!modelsRef.current.has(fileId)) {
        const file = findNodeById(fileId, true);
        if (file?.type === 'file') {
          const model = monaco.editor.createModel(
            file.content,
            getFileLanguage(file.name),
            monaco.Uri.parse(`file:///${file.path}`)
          );
          
          const disposable = model.onDidChangeContent(() => {
            const currentContent = model.getValue();
            const originalContent = findNodeById(fileId, true)?.content;
            
            updateFileContent(fileId, currentContent, true);
            
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
      disposables.forEach(d => d.dispose());
    };
  }, [openFileIds, findNodeById, updateFileContent]);

  useEffect(() => {
    const editor = editorRef.current;
    const model = activeFileId ? modelsRef.current.get(activeFileId) : null;
    
    if (editor && editor.getModel() !== model) {
      editor.setModel(model || null);
    }
  }, [activeFileId]);

  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco) return;

    const onMarkerChange = () => {
      const allProblems: Problem[] = [];
      const models = monaco.editor.getModels();
      
      models.forEach(model => {
        const markers = monaco.editor.getModelMarkers({ resource: model.uri });
        const filePath = model.uri.path.substring(1);

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
    onMarkerChange();

    return () => {
      disposable.dispose();
    };
  }, [openFileIds]);


  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;

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
    const editor = editorRef.current;
    if (!editor) return;
    
    logToOutput(`Formatting document...`);
    setIsFormatting(true);
    try {
      await editor.getAction('editor.action.formatDocument')?.run();
      logToOutput(`Document formatted successfully.`);
      toast({
        title: "Code Formatted",
        description: `The document has been formatted.`,
      });
    } catch(error) {
       logToOutput(`Error formatting code: ${error}`);
       console.error("Formatting failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to format code.",
      });
    } finally {
      setIsFormatting(false);
    }
  }, [logToOutput, toast]);
  
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
  
  const handleNewUntitledFile = useCallback(() => {
    let i = 1;
    let newName = `Untitled-${i}`;
    while (findNodeByPath(newName)) {
      i++;
      newName = `Untitled-${i}`;
    }
    const newFileId = createFile(newName, null, '');
    if (newFileId) {
      openFile(newFileId);
    }
  }, [createFile, openFile, findNodeByPath]);

  const handleNewTerminal = useCallback(() => {
    if (!isBottomPanelOpen) {
      setIsBottomPanelOpen(true);
    }
    const newSession = createNewTerminalSession();
    setTerminalSessions(prev => [...prev, newSession]);
    setActiveTerminalId(newSession.id);
    return newSession.id;
  }, [isBottomPanelOpen]);

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
  }, []);

  const handleToggleTerminal = () => {
    setIsBottomPanelOpen(prev => !prev);
  };

  const goToLine = useCallback((line: number, column: number = 1) => {
    editorRef.current?.revealLineInCenter(line, monaco.editor.ScrollType.Smooth);
    editorRef.current?.setPosition({ lineNumber: line, column });
    editorRef.current?.focus();
  }, []);

  const handleGoToProblem = useCallback((problem: Problem) => {
    const targetNode = findNodeByPath(problem.file);
    if (targetNode && targetNode.type === 'file') {
      openFile(targetNode.id);
      setTimeout(() => goToLine(problem.line), 100);
    } else {
      toast({
        variant: "destructive",
        title: "File not found",
        description: `Could not find the file: ${problem.file}`
      })
    }
  }, [findNodeByPath, openFile, toast, goToLine]);

  const handleGoToSearchResult = useCallback((result: SearchResult) => {
    const targetNode = findNodeById(result.fileId);
    if (targetNode && targetNode.type === 'file') {
      openFile(targetNode.id);
      setTimeout(() => goToLine(result.line, result.column), 100);
    }
  }, [findNodeById, openFile, goToLine]);

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
    setOpenFileIds([]);
    setActiveFileId(null);
  };

  const handleCloseOtherTabs = (fileId: string) => {
    const otherFileIds = openFileIds.filter(id => id !== fileId);
    if (!confirmClose(otherFileIds)) return;
    setOpenFileIds([fileId]);
  };
  
  const handleTriggerEditorAction = (actionId: string) => {
    editorRef.current?.trigger('source', actionId, null);
  };

  const handleCommand = (commandId: string) => {
      switch (commandId) {
          case 'theme:toggle':
              toast({title: "Theme Toggle", description: "Theme toggling is not yet implemented."});
              break;
          case 'file:new':
              handleNewFile();
              break;
          case 'editor:format':
              handleFormatCode();
              break;
          default:
            handleTriggerEditorAction(commandId);
            break;
      }
  };

  const renderPanel = () => {
    switch (activePanel) {
      case "files":
        return <FileExplorer 
          ref={fileExplorerRef}
          files={files}
          openFileIds={openFileIds}
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
          refreshFileSystem={refreshFileSystem}
          onCloseFile={handleCloseTab}
        />;
      case "search":
        return <SearchPanel 
          onSearch={searchFiles}
          onGoToResult={handleGoToSearchResult}
        />;
      case "ai-assistant":
        return <AiAssistantPanel allFiles={files} />;
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
        <CommandPalette open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen} onCommand={handleCommand} />
        <ActivityBar activePanel={activePanel} onSelectPanel={setActivePanel} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header 
            onSuggest={handleSuggest}
            onFormat={handleFormatCode}
            onTriggerAction={handleTriggerEditorAction}
            isSuggesting={isSuggesting}
            isFormatting={isFormatting}
            onNewFile={handleNewFile}
            onNewFolder={handleNewFolder}
            isMinimapVisible={editorSettings.minimap}
            onToggleMinimap={(checked) => handleSettingsChange({ minimap: checked })}
            onNewTerminal={handleNewTerminal}
            onToggleTerminal={handleToggleTerminal}
            logOutput={logToOutput}
            onCommandPalette={() => setIsCommandPaletteOpen(true)}
          />
          <main className="flex-1 flex overflow-hidden">
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={20} minSize={15} maxSize={40} id="side-panel" order={1} className={cn("min-w-[200px] bg-card", activePanel === 'none' && "hidden")}>
                {renderPanel()}
              </ResizablePanel>
              {activePanel !== 'none' && <ResizableHandle withHandle />}
              <ResizablePanel id="main-panel" order={2}>
                 <ResizablePanelGroup direction="vertical" onLayout={(sizes) => {
                     setIsBottomPanelOpen(sizes[1] > 5);
                     setBottomPanelSize(sizes[1]);
                 }}>
                    <ResizablePanel defaultSize={100 - bottomPanelSize} minSize={20} order={1}>
                       <div className="flex-1 flex flex-col min-w-0 h-full">
                        <EditorTabs
                            openFileIds={openFileIds}
                            activeFileId={activeFileId}
                            onSelectTab={setActiveFileId}
                            onCloseTab={handleCloseTab}
                            onCloseAllTabs={handleCloseAllTabs}
                            onCloseOtherTabs={handleCloseOtherTabs}
                            onReorderTabs={setOpenFileIds}
                            findNodeById={findNodeById}
                            dirtyFileIds={dirtyFiles}
                            onNewUntitled={handleNewUntitledFile}
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
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                              <svg
                                  className="w-24 h-24 mb-4 text-gray-600"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M14.4645 19.232L21.3698 12.3267L23.1421 14.099L16.2368 21.0043L14.4645 19.232Z" fill="currentColor"/>
                                  <path d="M1.00439 14.099L7.90969 21.0043L9.68198 19.232L2.77668 12.3267L1.00439 14.099Z" fill="currentColor"/>
                                  <path d="M9.17188 3L2.26658 9.9053L4.03887 11.6776L10.9442 4.7723L9.17188 3Z" fill="currentColor"/>
                                  <path d="M21.8579 9.9053L14.9526 3L13.1803 4.7723L20.0856 11.6776L21.8579 9.9053Z" fill="currentColor"/>
                                </svg>
                                <p className="mb-4">Select a file to begin editing or create a new one.</p>
                                <button onClick={() => setIsCommandPaletteOpen(true)} className="text-sm text-primary hover:underline">Show all commands</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle className={cn(!isBottomPanelOpen && "hidden")} />
                    <ResizablePanel 
                      defaultSize={bottomPanelSize}
                      collapsedSize={5}
                      collapsible={true}
                      minSize={15} 
                      maxSize={80} 
                      id="bottom-panel" 
                      order={2}
                      onCollapse={() => setIsBottomPanelOpen(false)}
                      onExpand={() => setIsBottomPanelOpen(true)}
                      className={cn(isBottomPanelOpen ? "block" : "hidden")}
                    >
                      <Terminal 
                        problems={problems} 
                        onGoToProblem={handleGoToProblem} 
                        onClosePanel={() => setIsBottomPanelOpen(false)}
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
          <StatusBar 
            activeFile={activeFile}
            problems={problems}
          />
        </div>
      </div>
  );
}

export function IdeLayout() {
  const [isMounted, useState] = React.useState(false);

  useEffect(() => {
    useState(true);
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
