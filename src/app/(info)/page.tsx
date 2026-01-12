
'use client';

import { Button } from '@/components/ui/button';
import {
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useCallback } from 'react';
import Script from 'next/script';
import JSZip from 'jszip';
import { useToast } from '@/hooks/use-toast';
import { useOPFS } from '@/hooks/useOPFS';
import { useTheme } from '@/context/theme-context';
import type { FileSystemNode } from '@/hooks/useFileSystem';


declare global {
    interface Window {
        VANTA: any;
    }
}

export default function HomePage() {
  const { theme } = useTheme();
  const vantaRef = useRef(null);
  const vantaEffectRef = useRef<any>(null);
  const { toast } = useToast();
  const { readDirectory, isLoaded } = useOPFS();

  useEffect(() => {
    if (!window.VANTA || !vantaRef.current) return;

    // Destroy the previous instance if it exists
    if (vantaEffectRef.current) {
        vantaEffectRef.current.destroy();
    }

    // Create a new instance
    vantaEffectRef.current = window.VANTA.RINGS({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x4caf50, // Parrot green
        backgroundColor: theme === 'dark' ? 0x202429 : 0xf0f8f0, // Dark slate and light green
    });

    // Cleanup function to destroy the instance on component unmount
    return () => {
        if (vantaEffectRef.current) {
            vantaEffectRef.current.destroy();
        }
    };
  }, [theme]);


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
       <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js" strategy="lazyOnload" />
       <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.rings.min.js" strategy="lazyOnload" />
       
      <div className="relative isolate overflow-hidden h-screen">
        <div 
          ref={vantaRef} 
          className="absolute top-0 left-0 w-screen h-screen z-[-1]"
        ></div>
        <div className="container mx-auto px-4 py-24 text-center flex items-center justify-center h-full">
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
      </div>
      
      <div className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="card-hover-effect rounded-lg bg-card p-6 text-left animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-lg font-semibold">AI-Powered</h3>
            <p className="mt-2 text-sm text-muted-foreground">Leverage generative AI for code suggestions, generation, and formatting to boost your productivity.</p>
          </div>
          <div className="card-hover-effect rounded-lg bg-card p-6 text-left animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <h3 className="text-lg font-semibold">Fully Featured</h3>
            <p className="mt-2 text-sm text-muted-foreground">A complete IDE experience with a file explorer, multi-tab editor, and integrated terminal.</p>
          </div>
          <div className="card-hover-effect rounded-lg bg-card p-6 text-left animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <h3 className="text-lg font-semibold">Open Source</h3>
            <p className="mt-2 text-sm text-muted-foreground">Built on modern, open-source technologies like Next.js, Monaco, and Genkit. Contributions are welcome.</p>
          </div>
        </div>
      </div>
    </>
  );
}
