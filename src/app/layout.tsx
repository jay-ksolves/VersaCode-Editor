
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState('dark');
  
  useEffect(() => {
    const storedTheme = localStorage.getItem('versacode-theme');
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleSetTheme = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('versacode-theme', newTheme);
  };

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
      </head>
      <body className="font-body antialiased h-full" suppressHydrationWarning>
        <TooltipProvider>
            <div onMouseMove={handleMouseMove} className="h-full">
              {React.Children.map(children, child => {
                  if (React.isValidElement(child)) {
                      return React.cloneElement(child, { theme, setTheme: handleSetTheme } as any);
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
