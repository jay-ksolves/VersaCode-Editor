
'use client';

import { Button } from '@/components/ui/button';
import {
  Download,
  Wand2,
  Laptop,
  Github,
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
    <>
      <div className="relative z-10 text-center flex items-center justify-center h-full pt-16 sm:pt-0">
          <div className="mx-auto max-w-4xl animate-fade-in pt-4">
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
      <div className="relative z-10 bg-background py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
                <div className="mx-auto flex max-w-xs flex-col gap-y-4 card-hover-effect p-8 rounded-lg">
                    <Wand2 className="h-12 w-12 text-primary mx-auto" />
                    <h3 className="text-lg font-semibold leading-7 tracking-tight">AI-Powered</h3>
                    <p className="text-base leading-7 text-muted-foreground">Leverage generative AI for code suggestions, generation, and formatting to boost your productivity.</p>
                </div>
                 <div className="mx-auto flex max-w-xs flex-col gap-y-4 card-hover-effect p-8 rounded-lg">
                    <Laptop className="h-12 w-12 text-primary mx-auto" />
                    <h3 className="text-lg font-semibold leading-7 tracking-tight">Fully Featured</h3>
                    <p className="text-base leading-7 text-muted-foreground">A complete IDE experience with a file explorer, multi-tab editor, and integrated terminal.</p>
                </div>
                 <div className="mx-auto flex max-w-xs flex-col gap-y-4 card-hover-effect p-8 rounded-lg">
                    <Github className="h-12 w-12 text-primary mx-auto" />
                    <h3 className="text-lg font-semibold leading-7 tracking-tight">Open Source</h3>
                    <p className="text-base leading-7 text-muted-foreground">Built on modern, open-source technologies like Next.js, Monaco, and Genkit. Contributions are welcome.</p>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}
