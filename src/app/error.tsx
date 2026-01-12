'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex h-screen flex-col items-center justify-center bg-background text-center">
            <div className="animate-fade-in">
                <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-destructive mx-auto mb-4"
                >
                    <path d="M14.4645 19.232L21.3698 12.3267L23.1421 14.099L16.2368 21.0043L14.4645 19.232Z" fill="currentColor"/>
                    <path d="M1.00439 14.099L7.90969 21.0043L9.68198 19.232L2.77668 12.3267L1.00439 14.099Z" fill="currentColor"/>
                    <path d="M9.17188 3L2.26658 9.9053L4.03887 11.6776L10.9442 4.7723L9.17188 3Z" fill="currentColor"/>
                    <path d="M21.8579 9.9053L14.9526 3L13.1803 4.7723L20.0856 11.6776L21.8579 9.9053Z" fill="currentColor"/>
                </svg>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    Something went wrong!
                </h2>
                <p className="mt-4 text-muted-foreground animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    {error.message || 'An unexpected error occurred.'}
                </p>
                <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                    <Button onClick={() => reset()}>
                        Try again
                    </Button>
                </div>
            </div>
        </div>
      </body>
    </html>
  );
}
