# Paul Memorial — Next.js + GitHub Storage + Cloudinary

A memorial site that allows visitors to share memories and photos, with data stored directly in Git.

## Features

- **Clean, minimal memorial site** with About, Events, Memories, and Donate pages
- **Memory submissions** with name, email, message, and photos — no account required
- **Image optimization** via Cloudinary with automatic compression and format optimization
- **Git-based storage** for long-term durability and easy backup
- **Anti-spam protection** with Cloudflare Turnstile
- **Modern tech stack** - Next.js 15, React 19, Tailwind CSS v4

## Quick Start

1. **Clone and install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp env.example .env.local
   # Edit .env.local with your actual values
   ```

3. **Required setup** (see docs/PROJECT_DIRECTIONS.MD for detailed instructions):
   - Create a Cloudinary account and unsigned upload preset
   - Set up Cloudflare Turnstile for anti-spam
   - Configure GitHub token (for direct-to-git writes)
   - Configure environment variables

4. **Run development server**

   ```bash
   npm run dev
   ```

5. **Deploy**
   - Deploy to Vercel (recommended) or any Next.js-compatible platform
   - Set environment variables in your deployment platform

## Data Storage

- **Primary store:** `src/data/memories/*.json`
- **Redirects:** `src/data/redirects/*.json` (used for immutable edits)
- **Backups:** `backups/initial-migration-snapshot/`

Writes (create/edit/delete) are committed to GitHub via the GitHub API and trigger a redeploy.
Reads are local JSON during runtime.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── about/             # About page
│   ├── events/            # Events page
│   ├── memories/          # Memories pages
│   └── photos/            # Photo pages
├── components/            # React components
└── lib/                   # Utilities and integrations
data/
└── memories/             # Legacy folder (not used)
backups/
└── initial-migration-snapshot/  # Snapshot backup
```

## Environment Variables

See `env.example` for all required environment variables.

## Contributing

This is a memorial site - please be respectful and thoughtful in any contributions.

## License

Private memorial project.

# Mon Aug 18 14:26:21 EDT 2025

# Mon Aug 18 14:49:05 EDT 2025 - Force redeploy for debugging

# Mon Aug 18 18:09:53 EDT 2025
