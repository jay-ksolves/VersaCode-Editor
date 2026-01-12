
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  Download,
  Github,
  Moon,
  Rss,
  Twitter,
  Youtube,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-background text-foreground flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary"
              >
                <path
                  d="M14.4645 19.232L21.3698 12.3267L23.1421 14.099L16.2368 21.0043L14.4645 19.232Z"
                  fill="currentColor"
                />
                <path
                  d="M1.00439 14.099L7.90969 21.0043L9.68198 19.232L2.77668 12.3267L1.00439 14.099Z"
                  fill="currentColor"
                />
                <path
                  d="M9.17188 3L2.26658 9.9053L4.03887 11.6776L10.9442 4.7723L9.17188 3Z"
                  fill="currentColor"
                />
                <path
                  d="M21.8579 9.9053L14.9526 3L13.1803 4.7723L20.0856 11.6776L21.8579 9.9053Z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-lg font-semibold">VersaCode</span>
            </Link>
            <nav className="hidden items-center gap-6 text-sm md:flex">
              <Link href="/docs" className="text-muted-foreground transition-colors hover:text-foreground">
                Docs
              </Link>
              <Link href="/updates" className="text-muted-foreground transition-colors hover:text-foreground">
                Updates
              </Link>
              <Link href="/blog" className="text-muted-foreground transition-colors hover:text-foreground">
                Blog
              </Link>
              <Link href="/api" className="text-muted-foreground transition-colors hover:text-foreground">
                API
              </Link>
              <Link href="/extensions" className="text-muted-foreground transition-colors hover:text-foreground">
                Extensions
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" title="Toggle Theme (coming soon)">
              <Moon className="h-5 w-5" />
            </Button>
            <Link href="/editor" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
               Go to Editor
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-24 text-center">
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
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 pb-24">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-card p-6 text-left animate-slide-up" style={{ animationDelay: '0.6s' }}>
                <h3 className="font-semibold text-lg">AI-Powered</h3>
                <p className="mt-2 text-sm text-muted-foreground">Leverage generative AI for code suggestions, generation, and formatting to boost your productivity.</p>
              </div>
              <div className="rounded-lg bg-card p-6 text-left animate-slide-up" style={{ animationDelay: '0.7s' }}>
                <h3 className="font-semibold text-lg">Fully Featured</h3>
                <p className="mt-2 text-sm text-muted-foreground">A complete IDE experience with a file explorer, multi-tab editor, and integrated terminal.</p>
              </div>
              <div className="rounded-lg bg-card p-6 text-left animate-slide-up" style={{ animationDelay: '0.8s' }}>
                <h3 className="font-semibold text-lg">Open Source</h3>
                <p className="mt-2 text-sm text-muted-foreground">Built on modern, open-source technologies like Next.js, Monaco, and Genkit. Contributions are welcome.</p>
              </div>
            </div>
        </div>
      </main>
      
      <footer className="border-t">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 py-12">
            <div>
              <h3 className="font-semibold mb-2">VersaCode</h3>
              <p className="text-sm text-muted-foreground">The AI-Native Web IDE.</p>
               <div className="flex items-center gap-4 text-muted-foreground mt-4">
                <a href="#" className="hover:text-foreground" title="GitHub"><Github className="h-5 w-5" /></a>
                <a href="#" className="hover:text-foreground" title="Twitter"><Twitter className="h-5 w-5" /></a>
                <a href="#" className="hover:text-foreground" title="YouTube"><Youtube className="h-5 w-5" /></a>
                <a href="#" className="hover:text-foreground" title="RSS Feed"><Rss className="h-5 w-5" /></a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Product</h3>
              <nav className="flex flex-col gap-2 text-sm">
                  <Link href="/updates" className="text-muted-foreground hover:text-primary">Updates</Link>
                  <Link href="/docs" className="text-muted-foreground hover:text-primary">Docs</Link>
                   <Link href="/editor" className="text-muted-foreground hover:text-primary">Editor</Link>
              </nav>
            </div>
             <div>
              <h3 className="font-semibold mb-2">Community</h3>
              <nav className="flex flex-col gap-2 text-sm">
                  <Link href="#" className="text-muted-foreground hover:text-primary">GitHub</Link>
                  <Link href="#" className="text-muted-foreground hover:text-primary">Contributors</Link>
                  <Link href="/blog" className="text-muted-foreground hover:text-primary">Blog</Link>
              </nav>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Legal</h3>
              <nav className="flex flex-col gap-2 text-sm">
                <Link href="/support" className="text-muted-foreground hover:text-primary">Support</Link>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy</Link>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Use</Link>
                <Link href="/license" className="text-muted-foreground hover:text-primary">License</Link>
              </nav>
            </div>
        </div>
         <div className="border-t">
          <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} VersaCode. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
