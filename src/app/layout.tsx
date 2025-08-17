'use client'
import './globals.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  return (
    <html lang="en">
      <body>
        <header className="border-b">
          <nav className="max-w-4xl mx-auto flex items-center justify-between py-4 px-2">
            <div className="font-semibold">Paul Bedrosian</div>
            <div className="space-x-4 text-sm">
              <Link 
                href="/" 
                className={isActive('/') ? 'text-blue-600 font-medium' : 'hover:text-blue-600'}
              >
                Home
              </Link>
              <Link 
                href="/about" 
                className={isActive('/about') ? 'text-blue-600 font-medium' : 'hover:text-blue-600'}
              >
                About
              </Link>
              <Link 
                href="/events" 
                className={isActive('/events') ? 'text-blue-600 font-medium' : 'hover:text-blue-600'}
              >
                Events
              </Link>
              <Link 
                href="/memories" 
                className={isActive('/memories') ? 'text-blue-600 font-medium' : 'hover:text-blue-600'}
              >
                Memories
              </Link>
              <Link 
                href="/photos" 
                className={isActive('/photos') ? 'text-blue-600 font-medium' : 'hover:text-blue-600'}
              >
                Photos
              </Link>
              <Link 
                href="/donate" 
                className={isActive('/donate') ? 'text-blue-600 font-medium' : 'text-blue-700 hover:text-blue-800'}
              >
                Donate
              </Link>
            </div>
          </nav>
        </header>
        <main className="max-w-7xl mx-auto py-8 px-2">{children}</main>
        <footer className="max-w-4xl mx-auto py-12 text-sm text-gray-500 px-2">Made with love by friends & family</footer>
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async defer
        />
      </body>
    </html>
  )
}
