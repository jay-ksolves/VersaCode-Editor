
'use client';

import { Button } from '@/components/ui/button';
import { Github, Moon, Rss, Sun, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/theme-context';
import React, { useRef, useEffect, useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    VANTA: any;
  }
}

interface InfoLayoutProps {
  children: React.ReactNode;
}

export default function InfoLayout({ children }: InfoLayoutProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const isHomePage = pathname === '/';

  const vantaRef = useRef(null);
  const vantaEffectRef = useRef<any>(null);
  const [isThreeLoaded, setIsThreeLoaded] = useState(false);

  useEffect(() => {
    if (!isHomePage || !isThreeLoaded || !window.VANTA || !vantaRef.current) {
        if(vantaEffectRef.current) vantaEffectRef.current.destroy();
        return;
    };

    if (vantaEffectRef.current) {
        vantaEffectRef.current.destroy();
    }

    const vantaColor = theme === 'dark' ? 0x4b0082 : 0xa020f0; 
    const bgColor = theme === 'dark' ? 0x1a1a2e : 0xe6e6fa;

    vantaEffectRef.current = window.VANTA.RINGS({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: vantaColor,
        backgroundColor: bgColor,
    });

    return () => {
        if (vantaEffectRef.current) {
            vantaEffectRef.current.destroy();
        }
    };
  }, [theme, isThreeLoaded, isHomePage]);

  if (pathname === '/editor') {
    return <>{children}</>;
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };
  
  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js" 
        strategy="lazyOnload" 
        onLoad={() => setIsThreeLoaded(true)}
      />
      {isThreeLoaded && (
        <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.rings.min.js" strategy="lazyOnload" />
      )}
      <div className="bg-background text-foreground flex flex-col min-h-screen relative">
        {isHomePage && <div ref={vantaRef} className="absolute inset-0 z-0" />}

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
              <Button variant="ghost" size="icon" title="Toggle Theme" onClick={toggleTheme} aria-label="Toggle Theme">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <Link href="/editor" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Go to Editor
              </Link>
            </div>
          </div>
        </header>

        <main className={isHomePage ? 'flex-1' : 'container mx-auto flex-1 px-4 py-8'}>
          <div className={isHomePage ? 'h-full' : 'max-w-4xl mx-auto'}>
            {children}
          </div>
        </main>

        <footer className="border-t z-10 bg-background">
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 py-12">
              <div>
                <h3 className="font-semibold mb-2">VersaCode</h3>
                <p className="text-sm text-muted-foreground">The AI-Native Web IDE.</p>
                 <div className="flex items-center gap-4 text-muted-foreground mt-4">
                  <a href="#" className="hover:text-foreground" title="GitHub" aria-label="GitHub"><Github className="h-5 w-5" /></a>
                  <a href="#" className="hover:text-foreground" title="Twitter" aria-label="Twitter"><Twitter className="h-5 w-5" /></a>
                  <a href="#" className="hover:text-foreground" title="YouTube" aria-label="YouTube"><Youtube className="h-5 w-5" /></a>
                  <a href="#" className="hover:text-foreground" title="RSS Feed" aria-label="RSS Feed"><Rss className="h-5 w-5" /></a>
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
    </>
  );
}
