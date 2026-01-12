
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
import JSZip from 'jszip';
import { LoaderCircle } from "lucide-react";
import { SourceControlPanel } from "./source-control-panel";
import { RunDebugPanel } from "./run-debug-panel";

export type Problem = { severity: 'error' | 'warning'; message: string; file: string; line: number; };

const defaultEditorSettings = {
  minimap: true,
  fontSize: 14,
  autoSave: true,
};

const UI_STATE_STORAGE_KEY = 'versacode-ui-state';

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

interface IdeLayoutProps {
  theme: string;
  setTheme: (theme: string) => void;
}

function IdeLayoutContent({ theme, setTheme }: IdeLayoutProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>("files");
  const [output, setOutput] = useState<string[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [isFormatting, setIsFormatting] = useState<boolean>(false);
  const [editorSettings, setEditorSettings] = useState(defaultEditorSettings);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(true);
  const [terminalSessions, setTerminalSessions] = useState<TerminalSession[]>([]);
  const [activeTerminalId, setActiveTerminalId] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  
  // Refs for managing complex components and state
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);
  const fileExplorerRef = useRef<FileExplorerRef>(null);
  const modelsRef = useRef<Map<string, monaco.editor.ITextModel>>(new Map());
  const mainPanelGroupRef = useRef<any>(null);
  const sidePanelGroupRef = useRef<any>(null);
  const folderUploadRef = useRef<HTMLInputElement | null>(null);


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
  } = useFileSystem({ autoSave: editorSettings.autoSave });

  // Load and save UI state
  useEffect(() => {
    try {
      const storedUiState = localStorage.getItem(UI_STATE_STORAGE_KEY);
      if (storedUiState) {
        const {
          activePanel: storedActivePanel,
          bottomPanelOpen,
          editorSettings: storedSettings,
        } = JSON.parse(storedUiState);

        if (storedActivePanel) setActivePanel(storedActivePanel);
        setIsBottomPanelOpen(bottomPanelOpen);
        if (storedSettings) setEditorSettings(storedSettings);
      }
    } catch (e) {
      console.error("Failed to load UI state from localStorage", e);
    }
  }, []);

  const saveUiState = useCallback(() => {
    const uiState = {
      activePanel,
      bottomPanelOpen: isBottomPanelOpen,
      editorSettings,
    };
    localStorage.setItem(UI_STATE_STORAGE_KEY, JSON.stringify(uiState));
  }, [activePanel, isBottomPanelOpen, editorSettings]);

  useEffect(() => {
    saveUiState();
  }, [saveUiState]);

  // Hotkeys
  useHotkeys('ctrl+n, cmd+n', (e) => { e.preventDefault(); handleNewFile(); }, { preventDefault: true });
  useHotkeys('ctrl+s, cmd+s', (e) => { e.preventDefault(); toast({ title: "Auto-Save Enabled", description: "Your changes are saved automatically."}); }, { preventDefault: true });
  useHotkeys('ctrl+alt+f, cmd+alt+f', (e) => { e.preventDefault(); handleFormatCode(); }, { preventDefault: true });
  useHotkeys('ctrl+shift+p, cmd+shift+p', (e) => { e.preventDefault(); setIsCommandPaletteOpen(true); }, { preventDefault: true });
  useHotkeys('ctrl+b, cmd+b', (e) => { e.preventDefault(); setActivePanel(p => p === 'none' ? 'files' : 'none')}, { preventDefault: true });


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
        const file = findNodeById(fileId, false);
        if (file?.type === 'file') {
          const model = monaco.editor.createModel(
            file.content,
            getFileLanguage(file.name),
            monaco.Uri.parse(`file:///${file.path}`)
          );
          
          const disposable = model.onDidChangeContent(() => {
            const currentContent = model.getValue();
            updateFileContent(fileId, currentContent);
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
  
  const handleUploadFolderClick = () => {
    folderUploadRef.current?.click();
  };

  const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    toast({ title: "Uploading Folder...", description: "Processing your project files." });

    const newFileTree: FileSystemNode[] = [];
    const folderCache: { [key: string]: FileSystemNode } = {};

    const getOrCreateFolder = (path: string): FileSystemNode => {
        if (folderCache[path]) return folderCache[path];

        const parts = path.split('/');
        const folderName = parts.pop()!;
        const parentPath = parts.join('/');
        
        const parentFolder = getOrCreateFolder(parentPath);
        
        const newFolder: FileSystemNode = {
            id: `folder_${path}`,
            name: folderName,
            type: 'folder',
            path: path,
            children: [],
        };
        
        if (parentFolder) {
            (parentFolder as any).children.push(newFolder);
        } else {
            newFileTree.push(newFolder);
        }
        
        folderCache[path] = newFolder;
        return newFolder;
    };
    
    // Create a root node for the top-level files
    const rootName = files[0].webkitRelativePath.split('/')[0];
    const rootNode: FileSystemNode = {
        id: 'root',
        name: rootName,
        type: 'folder',
        path: rootName,
        children: [],
    };
    folderCache[rootName] = rootNode;


    for (const file of Array.from(files)) {
        const pathParts = file.webkitRelativePath.split('/');
        const fileName = pathParts.pop()!;
        const folderPath = pathParts.join('/');
        
        const parentFolder = folderCache[folderPath];
        if (!parentFolder || parentFolder.type !== 'folder') continue;

        const content = await file.text();
        const newFile: FileSystemNode = {
            id: `file_${file.webkitRelativePath}`,
            name: fileName,
            type: 'file',
            path: file.webkitRelativePath,
            content: content
        };
        parentFolder.children.push(newFile);
    }

    setFiles([rootNode]);
    setOpenFileIds([]);
    setActiveFileId(null);
    setExpandedFolders(new Set([rootNode.id]));
    toast({ title: "Folder Uploaded", description: `Project "${rootName}" is ready.` });
    
    // Reset file input
    if(event.target) event.target.value = '';
  };


  const handleNewUntitledFile = useCallback(() => {
    let i = 1;
    let newName = `Untitled-${i}`;
    // The findNodeByPath now correctly handles its input
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleNewTerminal, terminalSessions.length]);

  const handleToggleTerminal = () => {
    setIsBottomPanelOpen(prev => !prev);
  };
  
  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('versacode-theme', newTheme);
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

  const handleCloseTab = (fileId: string) => {
    closeFileFromHook(fileId);
  }
  
  const handleCloseEditor = () => {
    if (activeFileId) {
      closeFileFromHook(activeFileId);
    }
  }

  const handleCloseAllTabs = () => {
    setOpenFileIds([]);
    setActiveFileId(null);
  };

  const handleCloseOtherTabs = (fileId: string) => {
    setOpenFileIds([fileId]);
  };
  
  const handleTriggerEditorAction = (actionId: string) => {
    editorRef.current?.trigger('source', actionId, null);
  };

  const handleCommand = (commandId: string) => {
      switch (commandId) {
          case 'theme:toggle':
              handleToggleTheme();
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
  
  const handleDownloadZip = useCallback(async () => {
    toast({ title: 'Zipping project...', description: 'Please wait while we prepare your download.' });
    const zip = new JSZip();

    function addFilesToZip(zipFolder: JSZip, nodes: FileSystemNode[]) {
      for (const node of nodes) {
        if (node.type === 'file') {
          zipFolder.file(node.name, node.content);
        } else if (node.type === 'folder') {
          const newFolder = zipFolder.folder(node.name);
          if (newFolder) {
            addFilesToZip(newFolder, node.children);
          }
        }
      }
    }

    addFilesToZip(zip, files);

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'versacode-project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast({ title: 'Download Started', description: 'Your project zip file is downloading.' });
    } catch (error) {
      console.error('Failed to create zip file', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not create the zip file.' });
    }
  }, [files, toast]);

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
      case 'source-control':
        return <SourceControlPanel />;
      case 'run-debug':
        return <RunDebugPanel />;
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
        <input 
            type="file" 
            ref={folderUploadRef}
            onChange={handleFolderUpload}
            className="hidden"
            // @ts-ignore
            webkitdirectory="true" 
            directory="true"
        />
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
            onUploadFolder={handleUploadFolderClick}
            isMinimapVisible={editorSettings.minimap}
            onToggleMinimap={(checked) => handleSettingsChange({ minimap: checked })}
            onNewTerminal={handleNewTerminal}
            onToggleTerminal={handleToggleTerminal}
            logOutput={logToOutput}
            onCommandPalette={() => setIsCommandPaletteOpen(true)}
            onDownloadZip={handleDownloadZip}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onCloseEditor={handleCloseEditor}
          />
          <main className="flex-1 flex overflow-hidden">
            <ResizablePanelGroup direction="horizontal" ref={mainPanelGroupRef} onLayout={(sizes) => {
              const state = { side: sizes[0], main: sizes[1] };
              localStorage.setItem('versacode-main-layout', JSON.stringify(state));
            }}>
              <ResizablePanel 
                defaultSize={20} 
                minSize={15} 
                maxSize={40} 
                id="side-panel" 
                order={1} 
                className={cn("min-w-[200px] bg-card", activePanel === 'none' && "hidden")}
                collapsible
                collapsedSize={0}
              >
                {renderPanel()}
              </ResizablePanel>
              {activePanel !== 'none' && <ResizableHandle withHandle />}
              <ResizablePanel id="main-panel" order={2}>
                 <ResizablePanelGroup direction="vertical" ref={sidePanelGroupRef} onLayout={(sizes) => {
                    setIsBottomPanelOpen(sizes[1] > 5);
                    const state = { main: sizes[0], bottom: sizes[1] };
                    localStorage.setItem('versacode-side-layout', JSON.stringify(state));
                 }}>
                    <ResizablePanel defaultSize={75} minSize={20} order={1}>
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
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground animate-fade-in">
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
                      defaultSize={25}
                      collapsedSize={0}
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
                        output={output}
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

export function IdeLayout(props: IdeLayoutProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
        </div>
    ); 
  }
  
  return <IdeLayoutContent {...props} />;
}
