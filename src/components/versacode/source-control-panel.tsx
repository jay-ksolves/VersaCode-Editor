
'use client';

import { GitBranch, Check, MoreHorizontal, Minus, Plus, Eye, GitCommitHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { FileSystemNode } from "@/hooks/useFileSystem";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { ScrollArea } from "../ui/scroll-area";
import React, { useState } from "react";
import { FileIconComponent } from "./file-explorer";
import { useToast } from "@/hooks/use-toast";

interface SourceControlPanelProps {
    changedFiles: (FileSystemNode & { type: 'file' })[];
    stagedFiles: (FileSystemNode & { type: 'file' })[];
    onStageFile: (fileId: string) => void;
    onUnstageFile: (fileId: string) => void;
    onCommit: (message: string) => void;
    onOpenFile: (fileId: string) => void;
}

const ChangeItem = ({ file, onAction, onOpenFile, actionIcon: ActionIcon, actionTitle }: {
    file: FileSystemNode & { type: 'file' };
    onAction: (fileId: string) => void;
    onOpenFile: (fileId: string) => void;
    actionIcon: React.ElementType;
    actionTitle: string;
}) => (
    <div className="flex items-center group p-1 rounded-md hover:bg-muted">
        <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => onOpenFile(file.id)}>
            <FileIconComponent filename={file.name} />
            <span className="text-sm truncate">{file.name}</span>
            <span className="text-xs text-muted-foreground truncate">{file.path.substring(0, file.path.lastIndexOf('/'))}</span>
        </div>
        <div className="flex items-center opacity-0 group-hover:opacity-100">
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Open File" onClick={() => onOpenFile(file.id)}>
                <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" title={actionTitle} onClick={(e) => { e.stopPropagation(); onAction(file.id); }}>
                <ActionIcon className="h-4 w-4" />
            </Button>
        </div>
    </div>
);

export function SourceControlPanel({ changedFiles, stagedFiles, onStageFile, onUnstageFile, onCommit, onOpenFile }: SourceControlPanelProps) {
    const [commitMessage, setCommitMessage] = useState('');
    const { toast } = useToast();

    const handleCommit = () => {
        if (!commitMessage.trim()) {
            toast({ variant: 'destructive', title: 'Commit Failed', description: 'Commit message cannot be empty.' });
            return;
        }
        if (stagedFiles.length === 0) {
            toast({ variant: 'destructive', title: 'Commit Failed', description: 'There are no staged changes to commit.' });
            return;
        }
        onCommit(commitMessage);
        setCommitMessage('');
        toast({ title: 'Changes Committed', description: 'Your staged changes have been committed.' });
    };
    
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">Source Control</h2>
                <div className="flex items-center gap-1">
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCommit} title="Commit">
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                        <GitCommitHorizontal className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="p-4 space-y-2">
                <Input 
                    placeholder="Commit message" 
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCommit()}
                />
                <Button className="w-full" onClick={handleCommit}>Commit</Button>
            </div>
            
            <ScrollArea className="flex-1 border-t">
                {stagedFiles.length > 0 && (
                    <Collapsible defaultOpen={true} className="border-b">
                        <CollapsibleTrigger className="w-full text-left p-2 font-semibold text-sm">Staged Changes ({stagedFiles.length})</CollapsibleTrigger>
                        <CollapsibleContent className="p-2 space-y-1">
                            {stagedFiles.map(file => 
                                <ChangeItem key={`staged-${file.id}`} file={file} onAction={() => onUnstageFile(file.id)} onOpenFile={onOpenFile} actionIcon={Minus} actionTitle="Unstage Changes" />
                            )}
                        </CollapsibleContent>
                    </Collapsible>
                )}
                 {changedFiles.length > 0 && (
                    <Collapsible defaultOpen={true}>
                        <CollapsibleTrigger className="w-full text-left p-2 font-semibold text-sm">Changes ({changedFiles.length})</CollapsibleTrigger>
                        <CollapsibleContent className="p-2 space-y-1">
                             {changedFiles.map(file => 
                                <ChangeItem key={`changed-${file.id}`} file={file} onAction={() => onStageFile(file.id)} onOpenFile={onOpenFile} actionIcon={Plus} actionTitle="Stage Changes" />
                            )}
                        </CollapsibleContent>
                    </Collapsible>
                )}

                {stagedFiles.length === 0 && changedFiles.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                        <GitBranch className="w-10 h-10 mb-4" />
                        <p className="text-sm">No changes detected.</p>
                        <p className="text-xs mt-1">Your workspace is clean. Edit a file to get started.</p>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
