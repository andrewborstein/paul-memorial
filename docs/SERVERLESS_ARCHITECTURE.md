Implementation Plan (Next.js App Router) 0) Overview

Reads: JSON files in Vercel Blob (index.json, memories/<id>.json) → served via GET route handlers with s-maxage caching.

Writes: POST /api/memory writes the detail JSON and updates index.json. Photos are uploaded directly from the browser to Cloudinary; server only stores public_ids, captions, and order.

UX: drag‑to‑reorder, progress bars, “Publish” creates the memory instantly.

1. Packages & Project Structure

# add deps

`pnpm add @vercel/blob nanoid p-limit`

# (optional) for DnD sorting

`pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/modifiers`

```bash
/app
  /api
    /memories/route.ts         # GET list (index.json)
    /memory/route.ts           # POST create
    /memory/[id]/route.ts      # GET detail
  /memories
    /[id]/page.tsx             # Memory detail page (reads API)
  /new/page.tsx                # Create Memory form (uploads to Cloudinary)
/lib
  /data.ts                     # Blob read/write helpers
  /cloudinary.ts               # URL builder (f_auto,q_auto)
  /turnstile.ts                # (optional) server-side verify
/components
  /CreateMemoryForm.tsx
  /SortableGrid.tsx            # (optional) DnD wrapper
/types
  /memory.ts
```

2. Environment Variables

Create `.env.local`:

```env
# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_PRESET=unsigned_preset_name

# (optional) Turnstile
TURNSTILE_SECRET_KEY=0x0000000000000000000000000000000
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA

# Vercel Blob (no env needed if using default in same project)
```

Cloudinary preset: unsigned, locked down (allowed formats, max size, target folder), and either allow or disallow public IDs—both are OK since we store public_id.

3. Types

```tsx
// /types/memory.ts
export type MemoryIndexItem = {
  id: string;
  title: string;
  date: string; // ISO
  cover_url?: string; // derived from first photo
  photo_count: number;
};

export type MemoryPhoto = {
  public_id: string;
  caption?: string;
  taken_at?: string | null; // ISO
  sort_index: number;
};

export type MemoryDetail = {
  id: string;
  title: string;
  date: string; // ISO
  body?: string;
  photos: MemoryPhoto[];
};
```

4. Blob Helpers

```tsx
// /lib/data.ts
import { get, put } from '@vercel/blob';
import type { MemoryDetail, MemoryIndexItem } from '@/types/memory';

const INDEX_KEY = 'index.json';

async function readBlobJson<T>(key: string): Promise<T | null> {
  const file = await get(key).catch(() => null);
  if (!file) return null;
  const res = await fetch(file.downloadUrl);
  if (!res.ok) return null;
  return (await res.json()) as T;
}

async function writeBlobJson(key: string, value: unknown) {
  await put(key, JSON.stringify(value), {
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}

export async function readIndex(): Promise<MemoryIndexItem[]> {
  return (await readBlobJson<MemoryIndexItem[]>(INDEX_KEY)) ?? [];
}

export async function writeIndex(items: MemoryIndexItem[]) {
  await writeBlobJson(INDEX_KEY, items);
}

export async function readMemory(id: string): Promise<MemoryDetail | null> {
  return await readBlobJson<MemoryDetail>(`memories/${id}.json`);
}

export async function writeMemory(doc: MemoryDetail) {
  await writeBlobJson(`memories/${doc.id}.json`, doc);
}
```

Cloudinary URL helper:

```tsx
// /lib/cloudinary.ts
export function cldUrl(
  publicId: string,
  opts: { w?: number; h?: number; crop?: string } = {}
) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const parts = ['f_auto', 'q_auto'];
  if (opts.w) parts.push(`w_${opts.w}`);
  if (opts.h) parts.push(`h_${opts.h}`);
  if (opts.crop) parts.push(`c_${opts.crop}`);
  return `https://res.cloudinary.com/${cloud}/image/upload/${parts.join(',')}/${publicId}`;
}
```

(Optionally add .jpg at the end—unnecessary with f_auto.)

5. API Routes

GET list (edge‑cached)

```tsx
// /app/api/memories/route.ts
import { readIndex } from '@/lib/data';

export const revalidate = 60; // Next's ISR hint

export async function GET() {
  const list = await readIndex();
  return Response.json(list, {
    headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
  });
}
```

GET detail (edge‑cached)

```tsx
// /app/api/memory/[id]/route.ts
import { readMemory } from '@/lib/data';

export const revalidate = 60;

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const doc = await readMemory(params.id);
  if (!doc) return new Response('Not found', { status: 404 });
  return Response.json(doc, {
    headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
  });
}
```

POST create (writes detail + updates index)

```tsx
// /app/api/memory/route.ts
import { nanoid } from 'nanoid';
import { readIndex, writeIndex, writeMemory } from '@/lib/data';
import { cldUrl } from '@/lib/cloudinary';
// import { verifyTurnstile } from "@/lib/turnstile"; // optional

type PhotoInput = {
  public_id: string;
  caption?: string;
  sort_index?: number;
  taken_at?: string | null;
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
```
