
'use client';

import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function HomePage() {
  return (
    <>
      <div id="vanta-target" className="relative isolate overflow-hidden -mt-16 h-screen">
        <div className="vanta-background"></div>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Download className="mr-2 h-5 w-5" />
                    Download
                    <ChevronDown className="ml-2 h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem>Windows</DropdownMenuItem>
                  <DropdownMenuItem>macOS (Intel)</DropdownMenuItem>
                  <DropdownMenuItem>macOS (Apple Silicon)</DropdownMenuItem>
                  <DropdownMenuItem>Linux (deb)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="card-hover-effect rounded-lg bg-card p-6 text-left animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <h3 className="font-semibold text-lg">AI-Powered</h3>
            <p className="mt-2 text-sm text-muted-foreground">Leverage generative AI for code suggestions, generation, and formatting to boost your productivity.</p>
          </div>
          <div className="card-hover-effect rounded-lg bg-card p-6 text-left animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <h3 className="font-semibold text-lg">Fully Featured</h3>
            <p className="mt-2 text-sm text-muted-foreground">A complete IDE experience with a file explorer, multi-tab editor, and integrated terminal.</p>
          </div>
          <div className="card-hover-effect rounded-lg bg-card p-6 text-left animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <h3 className="font-semibold text-lg">Open Source</h3>
            <p className="mt-2 text-sm text-muted-foreground">Built on modern, open-source technologies like Next.js, Monaco, and Genkit. Contributions are welcome.</p>
          </div>
        </div>
      </div>
    </>
  );
}
