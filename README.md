# Paul Memorial — Next.js + Notion + Cloudinary

A ready-to-deploy memorial site that allows visitors to share tributes, photos, and memories.

## Features

- **Clean, minimal memorial site** with About, Events, Tributes, Memories, and Donate pages
- **Tribute submissions** with name, email, message, photos, and YouTube links — no account required
- **Image optimization** via Cloudinary with automatic compression and format optimization
- **Flexible data storage** - starts with Notion for easy setup, can export to JSON files for future-proofing
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

3. **Required setup** (see PROJECT_DIRECTIONS.MD for detailed instructions):
   - Create a Cloudinary account and unsigned upload preset
   - Create a Notion database for tributes
   - Set up Cloudflare Turnstile for anti-spam
   - Configure environment variables

4. **Run development server**

   ```bash
   npm run dev
   ```

5. **Deploy**
   - Deploy to Vercel (recommended) or any Next.js-compatible platform
   - Set environment variables in your deployment platform

## Data Sources

The site supports two data sources:

- **Notion** (default) - Easy to set up, great for MVP
- **JSON files** - Future-proof, works with static hosting

Switch between them by setting `DATA_SOURCE=notion` or `DATA_SOURCE=file` in your environment.

## Export to JSON

When ready to move away from Notion:

```bash
npm run export:json
```

This exports all tributes to `/data/tributes/*.json` files, then set `DATA_SOURCE=file` for a completely static site.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── about/             # About page
│   ├── events/            # Events page
│   ├── tributes/          # Tributes page with form
│   ├── memories/          # Media gallery
│   └── donate/            # Donation page
├── components/            # React components
└── lib/                   # Utilities and integrations
data/
└── tributes/             # JSON export directory
scripts/
└── export-notion-to-json.ts  # Export script
```

## Environment Variables

See `env.example` for all required environment variables.

## Contributing

This is a memorial site - please be respectful and thoughtful in any contributions.

## License

Private memorial project.
