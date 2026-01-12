'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-center">
        <div className="animate-fade-in">
            <h1 className="text-8xl font-bold text-primary animate-slide-up" style={{ animationDelay: '0.2s' }}>404</h1>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight animate-slide-up" style={{ animationDelay: '0.3s' }}>Page Not Found</h2>
            <p className="mt-4 text-muted-foreground animate-slide-up" style={{ animationDelay: '0.4s' }}>
                Sorry, the page you are looking for does not exist or has been moved.
            </p>
            <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <Button asChild>
                    <Link href="/">Go back to Homepage</Link>
                </Button>
            </div>
        </div>
    </div>
  );
}
