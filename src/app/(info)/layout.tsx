import { Button } from '@/components/ui/button';
import { Download, Github, Moon, Rss, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground">
      <header className="border-b">
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
            <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
              <Link href="/docs" className="hover:text-primary">
                Docs
              </Link>
              <Link href="/updates" className="hover:text-primary">
                Updates
              </Link>
              <Link href="/blog" className="hover:text-primary">
                Blog
              </Link>
              <Link href="/api" className="hover:text-primary">
                API
              </Link>
              <Link href="/extensions" className="hover:text-primary">
                Extensions
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Moon className="h-5 w-5" />
            </Button>
            <Link href="/editor">
              <Button>
                <Download className="mr-2 h-4 w-4" /> Go to Editor
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-16">{children}</main>
      <footer className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 text-sm md:flex-row">
          <div className="flex items-center gap-4">
            <Github className="h-5 w-5" />
            <Twitter className="h-5 w-5" />
            <Youtube className="h-5 w-5" />
            <Rss className="h-5 w-5" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="#" className="hover:text-primary">
              Support
            </Link>
            <Link href="#" className="hover:text-primary">
              Privacy
            </Link>
            <Link href="#" className="hover:text-primary">
              Terms of Use
            </Link>
            <Link href="#" className="hover:text-primary">
              License
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
