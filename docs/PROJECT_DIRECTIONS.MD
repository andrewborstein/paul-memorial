# Paul Memorial — Next.js + Notion (temp store) → JSON (future-proof) + Cloudinary

A ready-to-deploy starter that:

- Ships a clean, minimal memorial site (About, Events, Tributes, Memories, Donate link)
- Lets visitors post tributes (name/email/message) with multiple photos and YouTube links — **no account required**
- Compresses/optimizes images via Cloudinary (`f_auto,q_auto`)
- Stores new entries in **Notion** for fastest MVP onboarding (admin-friendly)
- Can **export** Notion entries to `/data/*.json` so the site can run **forever from files** (GitHub Pages/Vercel) without any SaaS
- Switch data source with `DATA_SOURCE=notion|file`
- Optional comments + edit/delete via emailed token (simple, file-based friendly pattern)

> Immediate updates: The UI reads through a server route (`/api/tributes`) that fetches from Notion (or JSON files). Submissions return immediately and optimistically render; a revalidation fetch ensures persistence.

---

## 0) One-time setup checklist

1. **Create Cloudinary unsigned upload preset**
   - Cloudinary → Settings → Upload → Upload presets → Add
   - Unsigned = **Enabled**
   - Folder: `memorial`
   - Allowed formats: `jpg,jpeg,png,webp,avif,heic,heif,mp4,mov`
   - Transformation on delivery: none (we’ll use `f_auto,q_auto,w_1600` in the URL)

2. **Create a Notion database (Tributes)**
   - Create a new database named `Tributes` (table view)
   - Properties:
     - **Name** (Title) – can be auto-filled with submitter name + timestamp
     - **JSON** (Rich text) – we will store the full JSON blob here (most future-proof)
     - (Optional) **Hidden** (Checkbox) – for soft-deletes
   - Share → Invite → New integration → create a Notion internal integration; copy its **Secret**
   - In the DB’s “...” menu → **Connections** → add your integration to grant DB access
   - Copy the **Database ID** from the URL (the 32-char hyphenated UUID)

3. **Cloudflare Turnstile** (anti-spam)
   - Create a Turnstile site key/secret (widget type: Managed)

4. **Deploy target**
   - Vercel (recommended) or Netlify. Vercel is simplest for Next.js App Router.

5. **.env** (see template below) — fill your secrets.

6. **(Optional, future-proof)** — plan migration
   - When ready, run `npm run export:json` to dump all Notion entries to `/data/tributes/*.json` and switch `DATA_SOURCE=file`.

---

## 1) Project structure

```
memorial-mvp/
  .env.local (your secrets)
  next.config.ts
  package.json
  postcss.config.js
  tailwind.config.ts
  tsconfig.json
  src/
    app/
      layout.tsx
      globals.css
      page.tsx
      about/page.tsx
      events/page.tsx
      donate/page.tsx
      tributes/page.tsx
      memories/page.tsx
      api/
        tributes/route.ts          # GET list
        submit-tribute/route.ts    # POST create
        add-comment/route.ts       # POST comment (optional)
        delete-tribute/route.ts    # POST soft delete (token)
    components/
      Nav.tsx
      Container.tsx
      TributeForm.tsx
      TributeCard.tsx
      MediaGrid.tsx
      YouTubeEmbed.tsx
    lib/
      notion.ts
      cloudinary.ts
      schema.ts
      utils.ts
  public/
    favicon.ico
  data/
    tributes/                    # (empty now; filled after export)
    index.json                   # (optional: generated index)
  scripts/
    export-notion-to-json.ts     # export to /data
```

---

## 2) package.json

```json
{
  "name": "memorial-mvp",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "export:json": "ts-node --compiler-options '{\"module\":\"commonjs\"}' scripts/export-notion-to-json.ts"
  },
  "dependencies": {
    "@notionhq/client": "^2.2.14",
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "zod": "^3.23.8",
    "uuid": "^9.0.1",
    "dayjs": "^1.11.11",
    "clsx": "^2.1.1"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.10",
    "typescript": "^5.6.2",
    "ts-node": "^10.9.2"
  }
}
```

---

## 3) next.config.ts

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
};
export default nextConfig;
```

---

## 4) tailwind + postcss

**tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss';
export default {
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          200: '#bfdbfe',
          500: '#3b82f6',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
```

**postcss.config.js**

```js
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

**src/app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}
body {
  @apply bg-white text-gray-900;
}
.container {
  @apply mx-auto max-w-4xl px-4;
```
