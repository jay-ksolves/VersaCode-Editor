
'use client';

import { Button } from '@/components/ui/button';
import {
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback } from 'react';
import JSZip from 'jszip';
import { useToast } from '@/hooks/use-toast';
import { useOPFS } from '@/hooks/useOPFS';
import type { FileSystemNode } from '@/hooks/useFileSystem';

export default function HomePage() {
  const { toast } = useToast();
  const { readDirectory, isLoaded } = useOPFS();
  
  const handleDownloadZip = useCallback(async () => {
    if (!isLoaded) {
      toast({ variant: 'destructive', title: 'File system not ready', description: 'Please wait a moment and try again.' });
      return;
    }
    const files = await readDirectory('');
    if (files.length === 0) {
        toast({ variant: 'destructive', title: 'Empty Project', description: 'There are no files to download.' });
        return;
    }
    toast({ title: 'Zipping project...', description: 'Please wait while we prepare your download.' });
    const zip = new JSZip();

    async function addFilesToZip(zipFolder: JSZip, nodes: FileSystemNode[]) {
      for (const node of nodes) {
        if (node.type === 'file') {
          zipFolder.file(node.name, node.content);
        } else if (node.type === 'folder') {
          const newFolder = zipFolder.folder(node.name);
          if (newFolder && node.children) {
            await addFilesToZip(newFolder, node.children);
          }
        }
      }
    }

    await addFilesToZip(zip, files);

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
  }, [isLoaded, readDirectory, toast]);
  
  return (
    <div className="relative z-10 text-center flex items-center justify-center h-full">
        <div className="mx-auto max-w-4xl animate-fade-in">
          <div className="mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              href="/updates"
              className="inline-block rounded-full bg-secondary px-4 py-1 text-sm text-secondary-foreground"
            >
              Version 1.0 is now available!
            </Link>
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl animate-slide-up" style={{ animationDelay: '0.3s' }}>
            The AI-Native Web IDE
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl animate-slide-up" style={{ animationDelay: '0.4s' }}>
            Free, open-source, and built for the modern developer. The future of coding is in your browser.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/editor">
                Launch Editor
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={handleDownloadZip}>
              <Download className="mr-2 h-5 w-5" />
              Download Project
            </Button>
          </div>
        </div>
    </div>
  );
}
