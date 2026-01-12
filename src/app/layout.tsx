
'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import React,
{
    useState,
    useEffect
} from 'react';
import {
    TooltipProvider
} from '@/components/ui/tooltip';
import Script from 'next/script';

// Metadata export has been removed from here because the root layout must be a client component
// to support the onMouseMove handler. We will handle metadata in a different way if needed.

declare global {
    interface Window {
        VANTA: any;
    }
}

function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('dark');
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  
  useEffect(() => {
    const storedTheme = localStorage.getItem('versacode-theme');
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    if (window.VANTA && theme === 'dark') {
      if (!vantaEffect) {
        const effect = window.VANTA.RINGS({
          el: "#vanta-target",
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x88ff00,
          backgroundColor: 0x202428,
        });
        setVantaEffect(effect);
      }
    } else {
      if (vantaEffect) {
        vantaEffect.destroy();
        setVantaEffect(null);
      }
    }

    return () => {
      if (vantaEffect) {
        vantaEffect.destroy();
      }
    };
  }, [theme, vantaEffect]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const cards = document.querySelectorAll('.card-hover-effect');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty('--x', `${x}px`);
        (card as HTMLElement).style.setProperty('--y', `${y}px`);
    });
  };

  return (
    <html lang="en" className={theme} style={{colorScheme: theme}} suppressHydrationWarning>
      <head>
        <title>VersaCode - The AI-Native Web IDE</title>
        <meta name="description" content="A free, open-source, and AI-native web-based IDE for the modern developer. Built with Next.js and Monaco." />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js" />
        <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.rings.min.js" />
      </head>
      <body className="font-body antialiased h-full" suppressHydrationWarning>
        <TooltipProvider>
            <div onMouseMove={handleMouseMove} className="h-full">
              {React.Children.map(children, child => {
                  if (React.isValidElement(child)) {
                      return React.cloneElement(child, { theme, setTheme } as any);
                  }
                  return child;
              })}
            </div>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  )
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientWrapper>
      {children}
    </ClientWrapper>
  );
}
