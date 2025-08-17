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

1) **Create Cloudinary unsigned upload preset**
   - Cloudinary → Settings → Upload → Upload presets → Add
   - Unsigned = **Enabled**
   - Folder: `memorial`
   - Allowed formats: `jpg,jpeg,png,webp,avif,heic,heif,mp4,mov`
   - Transformation on delivery: none (we’ll use `f_auto,q_auto,w_1600` in the URL)

2) **Create a Notion database (Tributes)**
   - Create a new database named `Tributes` (table view)
   - Properties:
     - **Name** (Title) – can be auto-filled with submitter name + timestamp
     - **JSON** (Rich text) – we will store the full JSON blob here (most future-proof)
     - (Optional) **Hidden** (Checkbox) – for soft-deletes
   - Share → Invite → New integration → create a Notion internal integration; copy its **Secret**
   - In the DB’s “...” menu → **Connections** → add your integration to grant DB access
   - Copy the **Database ID** from the URL (the 32-char hyphenated UUID)

3) **Cloudflare Turnstile** (anti-spam)
   - Create a Turnstile site key/secret (widget type: Managed)

4) **Deploy target**
   - Vercel (recommended) or Netlify. Vercel is simplest for Next.js App Router.

5) **.env** (see template below) — fill your secrets.

6) **(Optional, future-proof)** — plan migration
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
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb'
    }
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' }
    ]
  }
}
export default nextConfig
```

---

## 4) tailwind + postcss

**tailwind.config.ts**
```ts
import type { Config } from 'tailwindcss'
export default {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff', 200: '#bfdbfe', 500: '#3b82f6', 700: '#1d4ed8'
        }
      }
    }
  },
  plugins: []
} satisfies Config
```

**postcss.config.js**
```js
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }
```

**src/app/globals.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: light; }
body { @apply bg-white text-gray-900; }
.container { @apply mx-auto max-w-4xl px-4; }
.card { @apply rounded-2xl border border-gray-200 p-4; }
.btn { @apply inline-flex items-center justify-center rounded-md bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 font-medium; }
.input { @apply w-full rounded-md border border-gray-300 px-3 py-2; }
.label { @apply block text-sm font-medium text-gray-700; }
```

---

## 5) .env.local (template)

```
# Data source: notion | file
DATA_SOURCE=notion

# Notion
NOTION_TOKEN=secret_xxx
NOTION_TRIBUTES_DB_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=memorial_unsigned

# Cloudflare Turnstile
TURNSTILE_SITE_KEY=0x4AAAA...
TURNSTILE_SECRET_KEY=1x0000...
```

---

## 6) lib/schema.ts (Zod schemas)
```ts
import { z } from 'zod'

export const mediaItem = z.object({
  type: z.enum(['image', 'youtube', 'video']).default('image'),
  url: z.string().url(),
  caption: z.string().optional()
})

export const tribute = z.object({
  id: z.string(),
  createdAt: z.string(),
  name: z.string().min(1),
  emailHash: z.string().optional(),
  body: z.string().min(1),
  media: z.array(mediaItem).default([]),
  comments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    body: z.string(),
    createdAt: z.string()
  })).default([]),
  editToken: z.string()
})

export type Tribute = z.infer<typeof tribute>
export type MediaItem = z.infer<typeof mediaItem>
```

---

## 7) lib/utils.ts
```ts
import crypto from 'crypto'

export function emailHash(email: string) {
  return crypto.createHash('sha1').update(email.trim().toLowerCase()).digest('hex')
}

export function youtubeId(url: string) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1)
    if (u.searchParams.get('v')) return u.searchParams.get('v')!
    return ''
  } catch { return '' }
}
```

---

## 8) lib/notion.ts
```ts
import { Client } from '@notionhq/client'
import { tribute, type Tribute } from './schema'

const token = process.env.NOTION_TOKEN!
const dbId = process.env.NOTION_TRIBUTES_DB_ID!

export const notion = new Client({ auth: token })

export async function listTributes(): Promise<Tribute[]> {
  const res = await notion.databases.query({ database_id: dbId, sorts: [{ timestamp: 'created_time', direction: 'descending' }] })
  const items: Tribute[] = []
  for (const p of res.results) {
    if (p.object !== 'page') continue
    const title = (p.properties['Name'] as any)?.title?.[0]?.plain_text || 'Tribute'
    const rich = (p.properties['JSON'] as any)?.rich_text?.[0]?.plain_text || '{}'
    try {
      const parsed = JSON.parse(rich)
      const t = tribute.parse({ ...parsed, name: parsed.name || title })
      // skip hidden
      if (parsed.hidden) continue
      items.push(t)
    } catch (e) { /* ignore bad rows */ }
  }
  return items
}

export async function createTribute(t: Tribute) {
  const title = `${t.name} — ${new Date(t.createdAt).toLocaleString()}`
  await notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      Name: { title: [{ type: 'text', text: { content: title } }] },
      JSON: { rich_text: [{ type: 'text', text: { content: JSON.stringify(t) } }] }
    }
  })
}

export async function updateTributeJSON(pageId: string, json: any) {
  await notion.pages.update({ page_id: pageId, properties: { JSON: { rich_text: [{ type: 'text', text: { content: JSON.stringify(json) } }] } } })
}
```

---

## 9) src/app/layout.tsx
```tsx
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
              <Link href="/tributes">Tributes</Link>
              <Link href="/memories">Memories</Link>
              <Link href="/donate" className="text-brand-700">Donate</Link>
            </div>
          </nav>
        </header>
        <main className="container py-8">{children}</main>
        <footer className="container py-12 text-sm text-gray-500">Made with love by friends & family</footer>
      </body>
    </html>
  )
}
```

---

## 10) Basic pages

**src/app/page.tsx**
```tsx
export default function Home() {
  return (
    <div className="prose max-w-none">
      <h1>Welcome</h1>
      <p>This site is a home for stories, photos, and events in memory of Paul.</p>
      <p>Please visit the <a href="/tributes">Tributes</a> page to share a note or story, and <a href="/memories">Memories</a> to add photos or videos.</p>
    </div>
  )
}
```

**src/app/about/page.tsx**
```tsx
export default function About() {
  return (
    <article className="prose max-w-none">
      <h1>About Paul</h1>
      <p>Write obituary/bio here...</p>
    </article>
  )
}
```

**src/app/events/page.tsx**
```tsx
export default function Events() {
  return (
    <section className="prose max-w-none">
      <h1>Events</h1>
      <p>Post past and upcoming memorial gatherings here.</p>
    </section>
  )
}
```

**src/app/donate/page.tsx**
```tsx
export default function Donate() {
  return (
    <section className="prose max-w-none">
      <h1>Donate</h1>
      <p><a className="btn" href="https://gofundme.com/" target="_blank">Go to GoFundMe</a></p>
    </section>
  )
}
```

**src/app/memories/page.tsx**
```tsx
import MediaGrid from '@/components/MediaGrid'

export default function Memories() {
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Memories</h1>
      <p className="mb-6 text-gray-600">Browse photos & video links shared in tributes.</p>
      <MediaGrid />
    </section>
  )
}
```

---

## 11) Tributes page & components

**src/app/tributes/page.tsx**
```tsx
'use client'
import useSWR from 'swr'
import TributeForm from '@/components/TributeForm'
import TributeCard from '@/components/TributeCard'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function TributesPage() {
  const { data, mutate, isLoading } = useSWR('/api/tributes', fetcher)

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-2xl font-semibold mb-3">Share a Tribute</h1>
        <p className="text-gray-600 mb-4">Write a note or story; add photos or a YouTube link. Email is used only to send you an edit link.</p>
        <TributeForm onCreated={(t) => mutate({ items: [t, ...(data?.items||[])] }, { revalidate: true })} />
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold">Recent Tributes</h2>
        {isLoading && <div>Loading…</div>}
        {data?.items?.map((t: any) => (
          <TributeCard key={t.id} tribute={t} />
        ))}
      </section>
    </div>
  )
}
```

**src/components/TributeForm.tsx**
```tsx
'use client'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function TributeForm({ onCreated }: { onCreated: (t: any) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [body, setBody] = useState('')
  const [youtube, setYoutube] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function uploadToCloudinary(files: FileList) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    const urls: { type: 'image'|'video', url: string }[] = []
    for (const f of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', f)
      fd.append('upload_preset', preset)
      // Let Cloudinary determine resource_type automatically
      fd.append('resource_type', 'auto')
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: 'POST', body: fd })
      const json = await res.json()
      const kind = json.resource_type === 'video' ? 'video' : 'image'
      // Delivery URL with on-the-fly optimization
      const url = json.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_1600/')
      urls.push({ type: kind, url })
    }
    return urls
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      let media: any[] = []
      if (files && files.length) media = await uploadToCloudinary(files)

      const res = await fetch('/api/submit-tribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, body, youtube, media })
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      onCreated(data.item)
      setName(''); setEmail(''); setBody(''); setYoutube(''); (document.getElementById('file') as HTMLInputElement).value=''
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card grid gap-3">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div>
        <label className="label">Your name</label>
        <input className="input" value={name} onChange={e=>setName(e.target.value)} required />
      </div>
      <div>
        <label className="label">Your email (for edit link)</label>
        <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="label">Message</label>
        <textarea className="input min-h-[120px]" value={body} onChange={e=>setBody(e.target.value)} required />
      </div>
      <div>
        <label className="label">YouTube URL (optional)</label>
        <input className="input" value={youtube} onChange={e=>setYoutube(e.target.value)} placeholder="https://youtu.be/..." />
      </div>
      <div>
        <label className="label">Photos / videos (optional)</label>
        <input id="file" className="input" type="file" multiple accept="image/*,video/*" onChange={e=>setFiles(e.target.files)} />
        <p className="text-xs text-gray-500 mt-1">Large files are auto-compressed by Cloudinary on delivery.</p>
      </div>
      {/* Turnstile */}
      <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}></div>
      <button disabled={submitting} className="btn">{submitting? 'Submitting…':'Post Tribute'}</button>
    </form>
  )
}
```

**src/components/TributeCard.tsx**
```tsx
import YouTubeEmbed from './YouTubeEmbed'

export default function TributeCard({ tribute }: { tribute: any }) {
  return (
    <article className="card">
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold">{tribute.name}</h3>
        <time className="text-xs text-gray-500">{new Date(tribute.createdAt).toLocaleString()}</time>
      </div>
      <p className="mt-2 whitespace-pre-wrap">{tribute.body}</p>
      <div className="mt-3 grid gap-3">
        {tribute.media?.map((m: any, i: number) => (
          m.type === 'image' ? (
            <img key={i} src={m.url} alt={m.caption || ''} className="rounded-lg" />
          ) : m.type === 'video' ? (
            <video key={i} src={m.url} controls className="rounded-lg" />
          ) : null
        ))}
        {tribute.media?.some((m: any) => m.type === 'youtube') && (
          tribute.media.filter((m: any)=>m.type==='youtube').map((m:any,i:number)=>(<YouTubeEmbed key={i} url={m.url} />))
        )}
      </div>
    </article>
  )
}
```

**src/components/YouTubeEmbed.tsx**
```tsx
export default function YouTubeEmbed({ url }: { url: string }) {
  let id = ''
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1)
    else id = u.searchParams.get('v') || ''
  } catch {}
  if (!id) return null
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg">
      <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${id}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    </div>
  )
}
```

**src/components/MediaGrid.tsx**
```tsx
'use client'
import useSWR from 'swr'
const fetcher = (u:string)=>fetch(u).then(r=>r.json())
export default function MediaGrid(){
  const { data } = useSWR('/api/tributes', fetcher)
  const media = (data?.items||[]).flatMap((t:any)=>t.media||[])
  if (!media.length) return <div>No media yet.</div>
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {media.map((m:any,i:number)=> m.type==='image' ? (
        <img key={i} src={m.url} className="rounded-lg" />
      ) : m.type==='video' ? (
        <video key={i} src={m.url} controls className="rounded-lg" />
      ) : null)}
    </div>
  )
}
```

---

## 12) API routes

**src/app/api/tributes/route.ts**
```ts
import { NextResponse } from 'next/server'
import { listTributes } from '@/lib/notion'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const source = process.env.DATA_SOURCE || 'notion'
    if (source === 'file') {
      const dir = path.join(process.cwd(), 'data', 'tributes')
      const files = await fs.readdir(dir)
      const items = [] as any[]
      for (const f of files.filter(f=>f.endsWith('.json'))) {
        const raw = await fs.readFile(path.join(dir, f), 'utf8')
        items.push(JSON.parse(raw))
      }
      items.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())
      return NextResponse.json({ items })
    }
    const items = await listTributes()
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ items: [] })
  }
}
```

**src/app/api/submit-tribute/route.ts**
```ts
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import { emailHash } from '@/lib/utils'
import { createTribute } from '@/lib/notion'

async function verifyTurnstile(token: string | undefined) {
  if (!process.env.TURNSTILE_SECRET_KEY) return true
  if (!token) return false
  const formData = new FormData()
  formData.append('secret', process.env.TURNSTILE_SECRET_KEY)
  formData.append('response', token)
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: formData })
  const data = await res.json()
  return !!data.success
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const ok = await verifyTurnstile((await req.headers).get('cf-turnstile-response') || body['cf-turnstile-response'])
    if (!ok) return new Response('Captcha failed', { status: 400 })

    const id = uuidv4().slice(0, 8)
    const editToken = uuidv4().replace(/-/g, '')
    const createdAt = dayjs().toISOString()

    const media = [
      ...(body.media||[]),
      ...(body.youtube ? [{ type: 'youtube', url: body.youtube }] : [])
    ]

    const item = {
      id,
      createdAt,
      name: body.name,
      emailHash: body.email ? emailHash(body.email) : undefined,
      body: body.body,
      media,
      comments: [],
      editToken
    }

    if ((process.env.DATA_SOURCE||'notion') === 'file') {
      // In file mode, write is not supported in serverless without FS write to repo; you can wire GitHub commits later.
      return NextResponse.json({ item }, { status: 201 })
    }

    await createTribute(item)
    return NextResponse.json({ item }, { status: 201 })
  } catch (e: any) {
    return new Response(e?.message || 'Error', { status: 500 })
  }
}
```

*(Comments and delete routes omitted for brevity; they would locate the Notion page by matching `id` in JSON and update the rich text block. For MVP, you can skip.)*

---

## 13) scripts/export-notion-to-json.ts

```ts
import fs from 'fs/promises'
import path from 'path'
import { listTributes } from '../src/lib/notion'

async function main(){
  const outDir = path.join(process.cwd(), 'data', 'tributes')
  await fs.mkdir(outDir, { recursive: true })
  const items = await listTributes()
  for (const t of items) {
    const fname = `${t.createdAt.replace(/[:.]/g,'-')}_${t.id}.json`
    await fs.writeFile(path.join(outDir, fname), JSON.stringify(t, null, 2), 'utf8')
  }
  console.log(`Exported ${items.length} tributes to /data/tributes`)
}
main().catch(e=>{ console.error(e); process.exit(1) })
```

---

## 14) Minimal Turnstile client script
Add this to `src/app/layout.tsx` right before `</body>`:
```tsx
<script
  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
  async defer
/>
```

Also expose the public env vars in `next.config.ts` if you want to reference them client-side, or prefix them as `NEXT_PUBLIC_` (already used in the form for Cloudinary & Turnstile).

---

## 15) How to run

```bash
# 1) Install
npm i

# 2) Create .env.local and fill values
cp .env.local .env.local # edit with your secrets

# 3) Dev
npm run dev

# 4) Deploy to Vercel
# (vercel CLI or import repo in Vercel dashboard)

# 5) After launch, export to files anytime
npm run export:json
# then set DATA_SOURCE=file and redeploy to serve from /data
```

---

## 16) Notes & tradeoffs
- **Immediate writes**: using Notion means entries appear as soon as `/api/tributes` fetches again (we optimistically insert into SWR cache too). If you want truly instant without Notion, replace the submit route to **commit JSON to GitHub** directly.
- **Images**: Cloudinary delivery URLs use `f_auto,q_auto,w_1600` for compression/format negotiation. You can tweak widths or add DPR.
- **Videos**: short clips are fine on Cloudinary free tier; for long videos prefer YouTube links.
- **No-login**: only name/email required. Email never stored in plaintext (only hash) in the JSON; you can email edit links from your Make.com flow later.
- **Design**: intentionally minimal; white label by changing colors and title.

---

## 17) Optional: Switch to GitHub JSON commits later (direct-to-git)
- Create a GitHub App or Fine-grained PAT with `contents:write` on the repo
- In `/api/submit-tribute`, replace `createTribute()` with an Octokit call to `PUT /repos/{owner}/{repo}/contents/{path}` writing `data/tributes/<ts>_<id>.json`
- Then set `DATA_SOURCE=file`; site renders purely from files. This is the most future-proof path.

---

## 18) Roadmap (if you have time)
- **Comments**: add `/api/add-comment` that finds the Notion page with matching `id` and appends to the `comments` array in its JSON property
- **Edit/Delete**: an `/edit` page that loads a file by path and `editToken`; submit updates to server route to overwrite JSON
- **Feeds**: generate a lightweight `index.json` of recent tributes for faster load
- **Accessibility**: alt text for images, captions UI

---

## 19) What you get out of the box
- Clean, usable memorial with About, Events, Tributes (with form + list), Memories gallery, Donate link
- MVP works **today** with Notion as the temp store and Cloudinary for media
- One command to export everything to files so the site can live on GitHub Pages forever

---

> If you want me to swap Notion for GitHub direct commits right away, I can generate an alternate `/api/submit-tribute` that uses Octokit and a PAT. But this version is fastest to get running now and migrates cleanly later.


---

# 📸 Albums, Captions, and Sorting (Drop‑in Module)

This section adds **albums** with per‑photo **captions**, **drag‑and‑drop sorting**, and cover images. Data is stored as **JSON files in `/data/albums/*.json`** (future‑proof), with Cloudinary URLs for media. You can create albums, add media, and re‑order images without a database.

> Works with the existing MVP. You can run on Notion for tributes and **direct‑to‑Git** for albums (or all file‑based). Reading is from static JSON; writing commits JSON via a tiny API using the GitHub API.

## A) New env vars

Add to `.env.local`:
```
# GitHub (direct‑to‑git commits for albums/media metadata)
GITHUB_TOKEN=ghp_xxx_fine_grained_contents_write
GITHUB_OWNER=yourgithub
GITHUB_REPO=memorial-mvp
GITHUB_BRANCH=main

# Security for album mutations (simple shared secret)
ADMIN_KEY=choose_a_long_random_string

# Optional CDN for read‑side (faster than raw.githubusercontent)
NEXT_PUBLIC_DATA_CDN_BASE=https://cdn.jsdelivr.net/gh/yourgithub/memorial-mvp@main
```

## B) package.json – add Octokit

```diff
   "dependencies": {
+    "@octokit/rest": "^20.1.0",
     "@notionhq/client": "^2.2.14",
     "next": "14.2.5",
     "react": "18.3.1",
```

Run: `npm i`

## C) Schema additions (`src/lib/schema.ts`)

```ts
export const albumMediaItem = mediaItem.extend({
  id: z.string(),
  order: z.number().int().nonnegative().default(0),
  takenAt: z.string().optional(),
  contributors: z.array(z.string()).optional()
})

export const album = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  coverMediaId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  media: z.array(albumMediaItem).default([])
})
export type Album = z.infer<typeof album>
export type AlbumMediaItem = z.infer<typeof albumMediaItem>
```

## D) GitHub helper (`src/lib/github.ts`)

```ts
import { Octokit } from '@octokit/rest'

const owner = process.env.GITHUB_OWNER!
const repo = process.env.GITHUB_REPO!
const branch = process.env.GITHUB_BRANCH || 'main'
const octo = new Octokit({ auth: process.env.GITHUB_TOKEN })

export async function getFile(path: string) {
  const { data } = await octo.repos.getContent({ owner, repo, path, ref: branch })
  if (!('content' in data)) throw new Error('Not a file')
  const buff = Buffer.from(data.content, 'base64')
  return { sha: data.sha, text: buff.toString('utf8') }
}

export async function putFile(path: string, content: string, message: string) {
  let sha: string | undefined
  try { sha = (await getFile(path)).sha } catch {}
  await octo.repos.createOrUpdateFileContents({
    owner, repo, path, message,
    content: Buffer.from(content).toString('base64'),
    branch, sha
  })
}
```

## E) API – list albums (`src/app/api/albums/route.ts`)

```ts
import { NextResponse } from 'next/server'

const base = process.env.NEXT_PUBLIC_DATA_CDN_BASE
  || `https://raw.githubusercontent.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/${process.env.GITHUB_BRANCH||'main'}`

export async function GET(){
  try {
    const url = `${base}/data/albums/index.json`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error('no index')
    const list = await res.json()
    return NextResponse.json({ items: list })
  } catch {
    // Fallback: no index yet
    return NextResponse.json({ items: [] })
  }
}
```

## F) API – create album (`src/app/api/albums/create/route.ts`)

```ts
import { NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import dayjs from 'dayjs'
import { album as AlbumSchema } from '@/lib/schema'
import { getFile, putFile } from '@/lib/github'

function slugify(s: string){
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
}

export async function POST(req: Request){
  if (process.env.ADMIN_KEY && req.headers.get('x-admin-key') !== process.env.ADMIN_KEY)
    return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const id = uuid().slice(0,8)
  const slug = slugify(body.title || `album-${id}`)
  const now = dayjs().toISOString()
  const data = {
    id, slug, title: body.title || 'Untitled Album', description: body.description || '',
    createdAt: now, updatedAt: now, media: []
  }
  AlbumSchema.parse(data)

  // Write album file
  await putFile(`data/albums/${slug}.json`, JSON.stringify(data, null, 2), `feat(album): create ${slug}`)

  // Update index.json
  let index: any[] = []
  try { index = JSON.parse((await getFile('data/albums/index.json')).text) } catch {}
  if (!index.find(a=>a.slug===slug)) index.unshift({ slug, title: data.title, createdAt: now })
  await putFile('data/albums/index.json', JSON.stringify(index, null, 2), `chore(albums): index add ${slug}`)

  return NextResponse.json({ item: data }, { status: 201 })
}
```

## G) API – add media with caption (`src/app/api/albums/[slug]/add-media/route.ts`)

```ts
import { NextResponse } from 'next/server'
import { getFile, putFile } from '@/lib/github'
import { v4 as uuid } from 'uuid'
import dayjs from 'dayjs'

export async function POST(req: Request, { params }: { params: { slug: string }}){
  if (process.env.ADMIN_KEY && req.headers.get('x-admin-key') !== process.env.ADMIN_KEY)
    return new Response('Unauthorized', { status: 401 })
  const slug = params.slug
  const body = await req.json() // { items: [{type,url,caption,takenAt,contributors[]}] }
  const path = `data/albums/${slug}.json`
  const file = await getFile(path)
  const album = JSON.parse(file.text)
  const start = album.media.length
  for (const it of body.items || []){
    album.media.push({ id: uuid().slice(0,8), order: album.media.length, ...it })
  }
  album.updatedAt = dayjs().toISOString()
  await putFile(path, JSON.stringify(album, null, 2), `feat(album): add ${album.media.length-start} items to ${slug}`)
  return NextResponse.json({ item: album })
}
```

## H) API – reorder media (`src/app/api/albums/[slug]/reorder/route.ts`)

```ts
import { NextResponse } from 'next/server'
import { getFile, putFile } from '@/lib/github'
import dayjs from 'dayjs'

export async function POST(req: Request, { params }: { params: { slug: string }}){
  if (process.env.ADMIN_KEY && req.headers.get('x-admin-key') !== process.env.ADMIN_KEY)
    return new Response('Unauthorized', { status: 401 })
  const body = await req.json() // { order: [mediaId1, mediaId2, ...] }
  const path = `data/albums/${params.slug}.json`
  const file = await getFile(path)
  const album = JSON.parse(file.text)
  const map = new Map<string, number>()
  body.order.forEach((id: string, i: number)=> map.set(id, i))
  album.media = album.media.map((m: any)=> ({ ...m, order: map.get(m.id) ?? m.order }))
  album.media.sort((a:any,b:any)=>a.order-b.order)
  album.updatedAt = dayjs().toISOString()
  await putFile(path, JSON.stringify(album, null, 2), `chore(album): reorder ${params.slug}`)
  return NextResponse.json({ item: album })
}
```

## I) UI – Albums list page (`src/app/albums/page.tsx`)

```tsx
'use client'
import useSWR from 'swr'
import Link from 'next/link'
const fetcher = (u:string)=>fetch(u).then(r=>r.json())

export default function AlbumsPage(){
  const { data } = useSWR('/api/albums', fetcher)
  const items = data?.items||[]
  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-semibold mb-3">Albums</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((a:any)=>(
          <Link key={a.slug} href={`/albums/${a.slug}`} className="card hover:bg-gray-50">
            <div className="font-medium">{a.title}</div>
            <div className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</div>
          </Link>
        ))}
        {!items.length && <div className="text-gray-500">No albums yet.</div>}
      </div>
    </section>
  )
}
```

Add a link to `/albums` in the top nav if you want a separate Albums page.

## J) UI – Album detail with drag‑sort (`src/app/albums/[slug]/page.tsx`)

```tsx
'use client'
import { useEffect, useState } from 'react'

async function fetchAlbum(slug: string){
  const base = process.env.NEXT_PUBLIC_DATA_CDN_BASE
    || `https://raw.githubusercontent.com/${process.env.NEXT_PUBLIC_GH_OWNER}/${process.env.NEXT_PUBLIC_GH_REPO}/${process.env.NEXT_PUBLIC_GH_BRANCH||'main'}`
  const res = await fetch(`${base}/data/albums/${slug}.json`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Not found')
  return res.json()
}

export default function AlbumDetail({ params }: { params: { slug: string }}){
  const [album, setAlbum] = useState<any>(null)
  const [dragId, setDragId] = useState<string| null>(null)

  useEffect(()=>{ fetchAlbum(params.slug).then(setAlbum).catch(()=>{}) }, [params.slug])

  if (!album) return <div>Loading…</div>

  function onDragStart(e: React.DragEvent<HTMLDivElement>, id: string){
    setDragId(id); e.dataTransfer.effectAllowed='move'
  }
  function onDrop(e: React.DragEvent<HTMLDivElement>, overId: string){
    e.preventDefault()
    if (!dragId || dragId===overId) return
    const arr = [...album.media]
    const from = arr.findIndex((m:any)=>m.id===dragId)
    const to = arr.findIndex((m:any)=>m.id===overId)
    const [moved] = arr.splice(from,1)
    arr.splice(to,0,moved)
    // optimistic
    arr.forEach((m:any,i:number)=>m.order=i)
    setAlbum({ ...album, media: arr })
  }
  async function saveOrder(){
    await fetch(`/api/albums/${album.slug}/reorder`, { method:'POST', headers: { 'Content-Type':'application/json', 'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '' }, body: JSON.stringify({ order: album.media.map((m:any)=>m.id) }) })
  }

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold mb-3">{album.title}</h1>
        <button className="btn" onClick={saveOrder}>Save order</button>
      </div>
      <p className="text-gray-600">{album.description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {album.media.map((m:any)=>(
          <div key={m.id}
               className="card"
               draggable
               onDragStart={(e)=>onDragStart(e, m.id)}
               onDragOver={(e)=>e.preventDefault()}
               onDrop={(e)=>onDrop(e, m.id)}>
            {m.type==='image' ? <img src={m.url} className="rounded-md"/> : m.type==='video' ? <video src={m.url} controls className="rounded-md"/> : null}
            {m.caption && <div className="mt-2 text-sm text-gray-700">{m.caption}</div>}
          </div>
        ))}
      </div>
    </section>
  )
}
```

> For the `x-admin-key` header on save, expose a **public** admin key only if you’re comfortable; otherwise, prompt for it once and keep it in `localStorage`, then send it from the client (still not perfect security—good enough for a small private memorial). For stronger auth, gate the page behind basic auth or a NextAuth email sign‑in for admins only.

## K) Adding media with captions to an album
Use the existing Cloudinary upload in your `TributeForm` or a new `AlbumUpload` form and then POST to:
```
POST /api/albums/{slug}/add-media
Headers: { 'x-admin-key': ADMIN_KEY }
Body: {
  "items": [
    { "type": "image", "url": "https://res.cloudinary.com/.../upload/f_auto,q_auto,w_1600/abc.webp", "caption": "At the lake", "takenAt": "2018-07-12" },
    { "type": "youtube", "url": "https://youtu.be/xyz", "caption": "Favorite song" }
  ]
}
```

## L) Sorting options (UI side)
- Default order = **explicit `order`** (drag‑drop).
- Secondary options in UI: sort by `takenAt` asc/desc or by `createdAt` (client‑side toggle).

## M) Migration / portability
- Everything album‑related lives under `/data/albums` and an `index.json` list. You can copy that folder to any static host (GitHub Pages) and it renders with the same front‑end.
- If Cloudinary ever changes, your pages still render text + you can backfill media later. For extra safety, you can add a script to periodically **mirror** Cloudinary assets to the repo.

---

**That’s it.** You now have albums with captions, grouping, and manual ordering — all as JSON in your repo, committed via GitHub API, and displayed from static reads. Hook the upload UI to the `add-media` endpoint and you’re live.
