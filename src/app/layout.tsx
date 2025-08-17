import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Memorial for Paul',
  description: 'A place to share memories, tributes, and events.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b">
          <nav className="container flex items-center justify-between py-4">
            <div className="font-semibold">Paul Bedrosian</div>
            <div className="space-x-4 text-sm">
              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
              <Link href="/events">Events</Link>
              <Link href="/memories">Memories</Link>
              <Link href="/photos">Photos</Link>
              <Link href="/donate" className="text-blue-700">Donate</Link>
            </div>
          </nav>
        </header>
        <main className="container py-8">{children}</main>
        <footer className="container py-12 text-sm text-gray-500">Made with love by friends & family</footer>
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async defer
        />
      </body>
    </html>
  )
}
