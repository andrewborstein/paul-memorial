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
  if (
    !body?.title ||
    !Array.isArray(body?.photos) ||
    body.photos.length === 0
  ) {
    return new Response('Invalid payload', { status: 400 });
  }

  // (optional) Turnstile verify
  // const ok = await verifyTurnstile(body.turnstileToken);
  // if (!ok) return new Response("Bot check failed", { status: 403 });

  const id = `mem_${nanoid(10)}`;
  const photos: PhotoInput[] = body.photos
    .filter(
      (p: PhotoInput) =>
        typeof p.public_id === 'string' && p.public_id.length > 0
    )
    .sort((a, b) => (a.sort_index ?? 0) - (b.sort_index ?? 0));

  const detail = {
    id,
    title: String(body.title).slice(0, 200),
    date: body.date ?? new Date().toISOString(),
    body: String(body.body ?? ''),
    photos: photos.map((p, i) => ({
      public_id: p.public_id,
      caption: p.caption ?? '',
      taken_at: p.taken_at ?? null,
      sort_index: i,
    })),
  };

  // Write detail first
  await writeMemory(detail);

  // Update index (prepend)
  const index = await readIndex();
  const coverPublicId = detail.photos[0]?.public_id;
  const nextIndex = [
    {
      id: detail.id,
      title: detail.title,
      date: detail.date,
      cover_url: coverPublicId ? cldUrl(coverPublicId, { w: 1200 }) : undefined,
      photo_count: detail.photos.length,
    },
    ...index,
  ].slice(0, 500); // keep it small
  await writeIndex(nextIndex);

  return Response.json({ id: detail.id }, { status: 201 });
}
```

6. Client: Create Form (uploads with concurrency + sorting)

```tsx
// /components/CreateMemoryForm.tsx
'use client';
import React from 'react';
import pLimit from 'p-limit';

type PhotoState = {
  file: File;
  preview: string;
  progress: number; // 0..100
  status: 'queued' | 'uploading' | 'done' | 'error';
  public_id?: string;
  caption?: string;
};

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!;

export default function CreateMemoryForm() {
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [photos, setPhotos] = React.useState<PhotoState[]>([]);
  const [isPublishing, setIsPublishing] = React.useState(false);

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const items = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'queued' as const,
    }));
    setPhotos((prev) => [...prev, ...items]);
  }

  function reorder(from: number, to: number) {
    setPhotos((prev) => {
      const next = prev.slice();
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      return next;
    });
  }

  async function uploadOne(ps: PhotoState): Promise<string> {
    const fd = new FormData();
    fd.append('file', ps.file);
    fd.append('upload_preset', PRESET);
    fd.append('folder', 'memories');

    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD}/upload`);
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const pct = Math.round((evt.loaded / evt.total) * 100);
          setPhotos((prev) =>
            prev.map((p) =>
              p === ps ? { ...p, progress: pct, status: 'uploading' } : p
            )
          );
        }
      };
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return;
        if (xhr.status >= 200 && xhr.status < 300) {
          const res = JSON.parse(xhr.responseText);
          resolve(res.public_id as string);
        } else {
          reject(new Error('Upload failed'));
        }
      };
      xhr.send(fd);
    });
  }

  async function ensureUploadsDone() {
    const limit = pLimit(4);
    const targets = photos.filter((p) => p.status !== 'done');
    await Promise.all(
      targets.map((p) =>
        limit(async () => {
          try {
            const pid = await uploadOne(p);
            setPhotos((prev) =>
              prev.map((x) =>
                x === p
                  ? { ...x, public_id: pid, progress: 100, status: 'done' }
                  : x
              )
            );
          } catch {
            setPhotos((prev) =>
              prev.map((x) => (x === p ? { ...x, status: 'error' } : x))
            );
          }
        })
      )
    );
  }

  async function onPublish() {
    setIsPublishing(true);
    const hasPending = photos.some((p) => p.status !== 'done');
    if (hasPending) await ensureUploadsDone();

    const payload = {
      title,
      body,
      date: new Date().toISOString(),
      photos: photos
        .map((p, i) => ({
          public_id: p.public_id!,
          caption: p.caption ?? '',
          sort_index: i,
        }))
        .filter((p) => !!p.public_id),
    };

    const r = await fetch('/api/memory', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      setIsPublishing(false);
      alert('Failed to publish');
      return;
    }
    const { id } = await r.json();
    window.location.href = `/memories/${id}`;
  }

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <input
        className="border p-2 w-full"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="border p-2 w-full"
        placeholder="Description"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <input type="file" accept="image/*" multiple onChange={onSelect} />

      {/* Minimal preview + manual reorder buttons (swap with @dnd-kit for drag/drop) */}
      <ul className="grid grid-cols-3 gap-2">
        {photos.map((p, i) => (
          <li key={i} className="border p-2">
            <img src={p.preview} alt="" className="w-full h-24 object-cover" />
            <div className="text-xs">
              {p.status} {p.progress}%
            </div>
            <div className="flex gap-1 mt-1">
              <button
                type="button"
                disabled={i === 0}
                onClick={() => reorder(i, i - 1)}
              >
                ↑
              </button>
              <button
                type="button"
                disabled={i === photos.length - 1}
                onClick={() => reorder(i, i + 1)}
              >
                ↓
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <button
          type="button"
          className="px-3 py-2 border"
          onClick={ensureUploadsDone}
        >
          Upload {photos.filter((p) => p.status !== 'done').length} files
        </button>
        <button
          type="button"
          className="px-3 py-2 border"
          disabled={!title || photos.length === 0 || isPublishing}
          onClick={onPublish}
        >
          {isPublishing ? 'Publishing...' : 'Publish memory'}
        </button>
      </div>
    </form>
  );
}
```

You can replace the ↑/↓ controls with @dnd-kit/sortable for true drag‑and‑drop.

7. Pages

```tsx
// /app/new/page.tsx
import CreateMemoryForm from '@/components/CreateMemoryForm';
export default function NewMemoryPage() {
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">New Memory</h1>
      <CreateMemoryForm />
    </main>
  );
}
```

```tsx
// /app/memories/[id]/page.tsx
import type { MemoryDetail } from '@/types/memory';
import { cldUrl } from '@/lib/cloudinary';

async function getMemory(id: string): Promise<MemoryDetail> {
  const r = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/memory/${id}`,
    {
      next: { revalidate: 60 },
    }
  );
  if (!r.ok) throw new Error('Not found');
  return r.json();
}

export default async function MemoryPage({
  params,
}: {
  params: { id: string };
}) {
  const mem = await getMemory(params.id);
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-semibold">{mem.title}</h1>
      <p className="opacity-70">{new Date(mem.date).toLocaleString()}</p>
      <article className="prose">{mem.body}</article>
      <section className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {mem.photos.map((p) => (
          <img
            key={p.public_id}
            src={cldUrl(p.public_id, { w: 1200 })}
            alt={p.caption ?? ''}
          />
        ))}
      </section>
    </main>
  );
}
```

NEXT_PUBLIC_BASE_URL is useful for server components (e.g., https://your-site.vercel.app). For client components you can fetch('/api/...').

8. (Optional) Turnstile Verify

```tsx
// /lib/turnstile.ts
export async function verifyTurnstile(token?: string) {
  if (!token) return false;
  const secret = process.env.TURNSTILE_SECRET_KEY!;
  const form = new URLSearchParams({ secret, response: token });
  const res = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      body: form,
    }
  );
  const data = (await res.json()) as { success: boolean };
  return data.success;
}
```

On the client, render the Turnstile widget and include the token in your POST payload.

9. Caching & Performance Notes

GET routes: s-maxage=60, stale-while-revalidate=300 makes reads instant and fresh within ~1 minute.

Images: always f_auto,q_auto + width; add srcset/sizes later if needed.

Concurrency: 4 parallel uploads is a good default for Cloudinary and keeps UI smooth.

Index consistency: we write memories/<id>.json first, then prepend to index.json. Worst case, the memory won’t appear in the list for up to 60s of CDN cache, but its direct URL works immediately.

10. Security & Abuse

Use a restricted unsigned preset (size/format limits, folder).

Add Turnstile to the POST endpoint if you expose the form publicly.

Don’t trust client captions blindly—length‑limit and strip HTML.

11. Migration (optional)

If you have existing data:

Export your Notion tables to CSV/JSON locally.

Write a one‑off Node script that creates memories/<id>.json and builds index.json (same shapes as above), then uploads both to Blob with put().

12. What to tell Cursor

Create files exactly as shown, wire env vars, ensure the Cloudinary preset exists.

Implement /new with CreateMemoryForm and test with 50 images.

Deploy to Vercel; confirm Blob writes and cache headers.

Replace manual reorder buttons with @dnd-kit/sortable if time permits.
