'use client';
import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import SuperUserBanner from '@/components/SuperUserBanner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <SuperUserBanner />
        <header className="border-b">
          <nav className="max-w-4xl mx-auto flex items-center justify-between py-4 px-2">
            <Link
              href="/"
              className="font-semibold hover:text-blue-600 transition-colors"
            >
              Paul Bedrosian
            </Link>
            <div className="space-x-4 text-sm">
              <Link
                href="/memories"
                className={
                  isActive('/memories')
                    ? 'text-blue-600 border-b border-blue-600'
                    : 'hover:text-blue-600'
                }
              >
                Memories
              </Link>
              <Link
                href="/photos"
                className={
                  isActive('/photos')
                    ? 'text-blue-600 border-b border-blue-600'
                    : 'hover:text-blue-600'
                }
              >
                Photos
              </Link>
              <Link
                href="/donate"
                className={
                  isActive('/donate')
                    ? 'text-blue-600 border-b border-blue-600'
                    : 'hover:text-blue-600'
                }
              >
                Donate
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1 py-8 px-2">{children}</main>
        <footer className="max-w-4xl mx-auto py-8 text-sm text-gray-500 px-5 md:px-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
            <span>Made with love by friends & family.</span>
            <span className="hidden sm:inline text-gray-300">•</span>
            <span>
              Send feedback or questions to{' '}
              <a
                href="mailto:contact@paulbedrosian.com"
                className="text-blue-600 hover:text-blue-800"
              >
                contact@paulbedrosian.com
              </a>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
