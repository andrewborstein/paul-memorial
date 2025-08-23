'use client';
import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { Suspense } from 'react';
import SuperUserBanner from '@/components/SuperUserBanner';
import AutoLoginHandler from '@/components/AutoLoginHandler';
import UserAvatar from '@/components/UserAvatar';

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
      <head>
        <link
          rel="preconnect"
          href="https://res.cloudinary.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <Suspense fallback={null}>
          <AutoLoginHandler />
        </Suspense>
        <SuperUserBanner />
        <header className="border-b border-stone-200 bg-white">
          <nav className="max-w-4xl mx-auto flex items-center justify-between py-4 px-2 flex-nowrap">
            <Link
              href="/"
              className="font-[Montserrat] font-bold text-1xl text-[#184a86] hover:text-[#123a6b] transition-colors"
            >
              Paul Bedrosian
            </Link>
            <div className="flex items-center space-x-4 text-sm">
              <Link
                href="/memories"
                className={
                  isActive('/memories')
                    ? 'text-[#184a86] border-b-2 border-[#184a86] font-medium'
                    : 'text-stone-600 hover:text-[#123a6b] transition-colors'
                }
              >
                Memories
              </Link>
              <Link
                href="/photos"
                className={
                  isActive('/photos')
                    ? 'text-[#184a86] border-b-2 border-[#184a86] font-medium'
                    : 'text-stone-600 hover:text-[#123a6b] transition-colors'
                }
              >
                Photos
              </Link>
              <Link
                href="/more"
                className={
                  isActive('/more')
                    ? 'text-[#184a86] border-b-2 border-[#184a86] font-medium'
                    : 'text-stone-600 hover:text-[#123a6b] transition-colors'
                }
              >
                More
              </Link>
              <UserAvatar />
            </div>
          </nav>
        </header>
        <main className="flex-1 py-8 px-2">{children}</main>
        <footer className="py-8 text-sm text-stone-500 px-5 md:px-2 border-t border-stone-200 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:gap-2">
            <span>Made with love by friends & family</span>
            <span className="hidden sm:inline-flex text-stone-300">•</span>
            <a
              href="mailto:contact@paulbedrosian.com"
              className="text-[#184a86] hover:text-[#1a35b3] transition-colors"
            >
              contact@paulbedrosian.com
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
