
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import type { FileSystemNode } from '@/hooks/useFileSystem';
import { CodeEditor } from './code-editor';
import { cn } from '@/lib/utils';
import { Bot, ChevronRight, Folder, FolderOpen, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { runAiAssistant } from '@/ai/flows/ai-assistant-flow';

const API_KEY_STORAGE_KEY = 'versacode_google_api_key';

interface AiAssistantPanelProps {
    allFiles: FileSystemNode[];
    getFileContent: (fileId: string) => Promise<string>;
}

function FileContextSelector({ 
    nodes, 
    level = 0,
    selectedFiles,
    onFileToggle,
}: { 
    nodes: FileSystemNode[], 
    level?: number,
    selectedFiles: Set<string>,
    onFileToggle: (id: string, selected: boolean) => void
}) {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    const sortedNodes = useMemo(() => [...nodes].sort((a, b) => {
        if (a.type === 'folder' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
    }), [nodes]);
    
    const handleToggleFolder = (folderId: string) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(folderId)) {
                newSet.delete(folderId);
            } else {
                newSet.add(folderId);
            }
            return newSet;
        })
    }

    return (
        <div className="space-y-1">
            {sortedNodes.map(node => {
                const isFolder = node.type === 'folder';
                const isExpanded = isFolder && expandedFolders.has(node.id);
                return (
                    <div key={node.id}>
                        <div 
                            className="flex items-center space-x-2 py-1"
                            style={{ paddingLeft: `${level * 1}rem` }}
                        >
                            {isFolder ? (
                                <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => handleToggleFolder(node.id)} data-testid={`ai-assistant-folder-context-${node.path}`}>
                                    <ChevronRight className={cn("w-4 h-4 transition-transform flex-shrink-0", isExpanded && "rotate-90")} />
                                    {isExpanded ? <FolderOpen className="w-4 h-4 text-accent" /> : <Folder className="w-4 h-4 text-accent" />}
                                    <span className="text-sm select-none">{node.name}</span>
                                </div>
                            ) : (
                                <>
                                    <div className="w-4" />
                                    <Checkbox 
                                        id={`file-ctx-${node.id}`}
                                        data-testid={`ai-assistant-file-context-checkbox-${node.path}`}
                                        checked={selectedFiles.has(node.id)}
                                        onCheckedChange={(checked) => onFileToggle(node.id, !!checked)}
                                    />
                                    <Label htmlFor={`file-ctx-${node.id}`} className="text-sm font-normal cursor-pointer">{node.name}</Label>
                                </>
                            )}
                        </div>
                        {isFolder && isExpanded && (
                            <FileContextSelector 
                                nodes={node.children} 
                                level={level + 1}
                                selectedFiles={selectedFiles}
                                onFileToggle={onFileToggle}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export function AiAssistantPanel({ allFiles, getFileContent }: AiAssistantPanelProps) {
    const [apiKey, setApiKey] = useState('');
    const [prompt, setPrompt] = useState('');
    const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const { toast } = useToast();
    
    useEffect(() => {
        const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (storedKey) {
            setApiKey(storedKey);
        }
    }, []);

    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setApiKey(e.target.value);
    };
    
    const handleSaveApiKey = () => {
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
        toast({ title: 'API Key Saved', description: 'Your Google AI API key has been saved locally.' });
    };

    const handleFileToggle = (fileId: string, selected: boolean) => {
        setSelectedFileIds(prev => {
            const newSet = new Set(prev);
            if (selected) {
                newSet.add(fileId);
            } else {
                newSet.delete(fileId);
            }
            return newSet;
        });
    };
    
    const buildContextString = useCallback(async (nodes: FileSystemNode[], ids: Set<string>): Promise<string> => {
        let contextParts: string[] = [];
        for (const node of nodes) {
            if (node.type === 'file' && ids.has(node.id)) {
                const content = await getFileContent(node.id);
                contextParts.push(`// FILE: ${node.path}\n\n${content}`);
            } else if (node.type === 'folder' && node.children) {
                const childContext = await buildContextString(node.children, ids);
                if (childContext) {
                    contextParts.push(childContext);
                }
            }
        }
        return contextParts.join('\n\n---\n\n');
    }, [getFileContent]);

    const handleGenerate = async () => {
        if (!apiKey) {
            toast({ variant: 'destructive', title: 'API Key Missing', description: 'Please enter your Google AI API key.' });
            return;
        }
        if (!prompt) {
            toast({ variant: 'destructive', title: 'Prompt Missing', description: 'Please enter a prompt.' });
            return;
        }

        setIsGenerating(true);
        setAiResponse('');
        try {
            const contextString = await buildContextString(allFiles, selectedFileIds);

            const result = await runAiAssistant({
                prompt,
                context: contextString,
                apiKey,
            });
            setAiResponse(result.generatedCode);

        } catch (error) {
            console.error('AI Assistant failed:', error);
            const errorMessage = (error instanceof Error) ? error.message : "An unknown error occurred.";
            toast({ variant: 'destructive', title: 'AI Assistant Error', description: errorMessage });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-full flex flex-col" data-testid="ai-assistant-panel">
            <div className="p-4 border-b flex items-center gap-2">
                <Bot className="h-6 w-6" />
                <h2 className="text-lg font-semibold tracking-tight">AI Assistant</h2>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="api-key">Google AI API Key</Label>
                        <div className="flex items-center gap-2">
                            <Input id="api-key" type="password" value={apiKey} onChange={handleApiKeyChange} placeholder="Enter your API key" data-testid="ai-assistant-api-key-input" />
                            <Button onClick={handleSaveApiKey} variant="outline" data-testid="ai-assistant-save-api-key-button">Save</Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>File Context</Label>
                        <div className="border rounded-md p-2 max-h-48 overflow-y-auto" data-testid="ai-assistant-file-context-selector">
                           <FileContextSelector nodes={allFiles} selectedFiles={selectedFileIds} onFileToggle={handleFileToggle} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="prompt">Prompt</Label>
                        <Textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5} placeholder="e.g., 'Refactor the selected files to use TypeScript' or 'Generate a new React component that...'" data-testid="ai-assistant-prompt-textarea" />
                    </div>
                    <Button onClick={handleGenerate} disabled={isGenerating} className="w-full" data-testid="ai-assistant-generate-button">
                        {isGenerating && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </Button>
                    {aiResponse && (
                         <div className="space-y-2" data-testid="ai-assistant-response-container">
                            <Label>AI Response</Label>
                            <div className="border rounded-md h-96">
                                <CodeEditor options={{ readOnly: true, domReadOnly: true, value: aiResponse }} />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
