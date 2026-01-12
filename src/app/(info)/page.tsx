
'use client';

import { Button } from '@/components/ui/button';
import {
  Download,
  Wand2,
  Laptop,
  Github,
  Database,
  GitBranch,
  Shield,
  Zap,
  Box,
  Terminal,
  Cpu,
  Server,
  Users,
  Search,
  BarChart,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback } from 'react';
import JSZip from 'jszip';
import { useToast } from '@/hooks/use-toast';
import { useOPFS } from '@/hooks/useOPFS';
import type { FileSystemNode } from '@/hooks/useFileSystem';
import { posts } from '@/lib/blog-posts';

const icons = [
    Users, GitBranch, Cpu, Server, Shield, Zap, Box, Search, BarChart, Terminal, Database
];

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

  const latestPosts = posts.slice(0, 2);
  
  return (
    <>
      <section className="relative z-10 text-center flex items-center justify-center h-screen">
          <div className="mx-auto max-w-4xl animate-fade-in pt-16">
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
      </section>

      <section className="relative z-10 bg-background py-24 sm:py-32">
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
      </section>

      <section className="relative z-10 bg-background py-24 sm:py-32 border-t">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Integrates with Your Favorite Tools</h2>
                <p className="mt-2 text-lg leading-8 text-muted-foreground">
                    Built to be extensible and compatible with the tools you already use.
                </p>
            </div>
            <div className="relative flex flex-col gap-4 overflow-hidden">
                <div className="flex min-w-full flex-shrink-0 animate-scroll-left gap-4">
                    {[...icons, ...icons].map((Icon, index) => (
                        <div key={`top-${index}`} className="flex aspect-square w-24 flex-shrink-0 items-center justify-center rounded-lg bg-card p-4 text-muted-foreground">
                            <Icon className="h-10 w-10" />
                        </div>
                    ))}
                </div>
                <div className="flex min-w-full flex-shrink-0 animate-scroll-right gap-4">
                     {[...icons, ...icons].map((Icon, index) => (
                        <div key={`bottom-${index}`} className="flex aspect-square w-24 flex-shrink-0 items-center justify-center rounded-lg bg-card p-4 text-muted-foreground">
                            <Icon className="h-10 w-10" />
                        </div>
                    ))}
                </div>
                 <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background to-transparent"></div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background to-transparent"></div>
            </div>
        </div>
      </section>


       <section className="relative z-10 bg-background py-24 sm:py-32 border-t">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">From the Blog</h2>
            <p className="mt-2 text-lg leading-8 text-muted-foreground">
              Read the latest news and insights from the VersaCode team.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            {latestPosts.map((post) => (
              <article key={post.id} className="card-hover-effect flex flex-col items-start justify-between p-8 rounded-lg">
                <div className="w-full">
                  <div className="flex items-center gap-x-4 text-xs">
                    <time dateTime={post.date} className="text-muted-foreground">
                      {post.date}
                    </time>
                  </div>
                  <div className="group relative">
                    <h3 className="mt-3 text-lg font-semibold leading-6 group-hover:text-primary">
                      <Link href={`/blog/${post.slug}`}>
                        <span className="absolute inset-0" />
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
