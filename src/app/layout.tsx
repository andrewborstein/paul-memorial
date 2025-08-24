'use client';
import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { Suspense } from 'react';
import SuperUserBanner from '@/components/SuperUserBanner';
import AutoLoginHandler from '@/components/AutoLoginHandler';
import UserAvatar from '@/components/UserAvatar';
import { CLOUDINARY_IMAGES } from '@/lib/constants';
import { getHeroImageUrl } from '@/lib/cloudinary';
import Image from 'next/image';

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

        {/* HTML Meta Tags */}
        <title>Remembering Paul Bedrosian</title>
        <meta
          name="description"
          content="A memorial to Paul Nshan Bedrosian. Share stories, photos, and memories."
        />

        {/* Facebook Meta Tags */}
        <meta property="og:url" content="https://paulbedrosian.com" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Remembering Paul Bedrosian" />
        <meta
          property="og:description"
          content="A memorial to Paul Nshan Bedrosian. Share stories, photos, and memories."
        />
        <meta
          property="og:image"
          content="https://opengraph.b-cdn.net/production/images/9a0bfdd6-c86a-4391-952b-a9f4827ab23d.png?token=q2jOi2cIsG9KnH6XVfOdO1XT6PQuEnsgC1Y4TU8Gwt4&height=514&width=1200&expires=33292063661"
        />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="paulbedrosian.com" />
        <meta property="twitter:url" content="https://paulbedrosian.com" />
        <meta name="twitter:title" content="Remembering Paul Bedrosian" />
        <meta
          name="twitter:description"
          content="A memorial to Paul Nshan Bedrosian. Share stories, photos, and memories."
        />
        <meta
          name="twitter:image"
          content="https://opengraph.b-cdn.net/production/images/9a0bfdd6-c86a-4391-952b-a9f4827ab23d.png?token=q2jOi2cIsG9KnH6XVfOdO1XT6PQuEnsgC1Y4TU8Gwt4&height=514&width=1200&expires=33292063661"
        />

        {/* Meta Tags Generated via https://www.opengraph.xyz */}
      </head>
      <body className="flex flex-col min-h-screen">
        <Suspense fallback={null}>
          <AutoLoginHandler />
        </Suspense>
        <SuperUserBanner />
        <header className="h-20">
          <div className="h-full flex flex-col">
            <div className="h-1/4" style={{ backgroundColor: '#55aa4d' }}></div>
            <div
              className="h-1/2 flex items-center"
              style={{ backgroundColor: '#fdd02b' }}
            >
              <nav className="max-w-4xl mx-auto flex items-center justify-between py-4 px-2 flex-nowrap w-full">
                <Link
                  href="/"
                  className="font-[Montserrat] text-black hover:text-gray-800 transition-colors"
                >
                  <div className="text-lg font-bold leading-none mb-[2px]">
                    PAUL BEDROSIAN
                  </div>
                  <div className="text-[11px] font-normal leading-none">
                    ONE LOVE ALWAYS 1983 - 2025
                  </div>
                </Link>
                <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-4 text-black hover:text-gray-800 transition-colors font-semibold uppercase text-xs border-b-2 border-transparent pt-[2px]">
                  <Link
                    href="/memories"
                    className={
                      isActive('/memories')
                        ? 'border-b-2 border-black pt-[2px]'
                        : ''
                    }
                  >
                    Memories
                  </Link>
                  <Link
                    href="/photos"
                    className={
                      isActive('/photos')
                        ? 'border-b-2 border-black pt-[2px]'
                        : ''
                    }
                  >
                    Photos
                  </Link>
                  <Link
                    href="/more"
                    className={
                      isActive('/more')
                        ? 'border-b-2 border-black pt-[2px]'
                        : ''
                    }
                  >
                    More
                  </Link>
                  <UserAvatar />
                </div>
              </nav>
            </div>
            <div className="h-1/4" style={{ backgroundColor: '#da2849' }}></div>
          </div>
        </header>
        <main className="flex-1">
          <div className="pt-8 pb-4">{children}</div>
        </main>
        <footer className="py-4 text-xs text-stone-500 px-5 md:px-2 border-t border-stone-200 bg-white">
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
