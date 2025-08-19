import { list, put, del, ListBlobResult } from '@vercel/blob';
import type { MemoryDetail, MemoryIndexItem } from '@/types/memory';

const BLOB_PREFIX = process.env.BLOB_PREFIX || '';
const INDEX_ITEM_PREFIX = 'index-items';

function k(key: string, prefix = BLOB_PREFIX) {
  return prefix ? `${prefix}/${key}` : key;
}

export async function readBlobJson<T>(
  key: string,
  opts?: { forceFresh?: boolean; cb?: string } // cb lets you pass updated_at
): Promise<T | null> {
  const token =
    process.env.BLOB_READ_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return null;

  const target = k(key);

  // paginate until we find an exact match
  let cursor: string | undefined = undefined;
  let file: { downloadUrl: string; pathname: string } | undefined;

  do {
    const page: ListBlobResult = await list({ prefix: target, cursor, token });
    file = page.blobs.find((b) => b.pathname === target);
    cursor = page.cursor || undefined;
  } while (!file && cursor);

  if (!file) return null;

  // cache-bust the Blob CDN hop when "fresh" or explicit cb provided
  const url = new URL(file.downloadUrl);
  const cacheBuster =
    opts?.cb || (opts?.forceFresh ? Date.now().toString() : '');
  if (cacheBuster) url.searchParams.set('cb', cacheBuster);

  // first hop: don't let node/RSC cache this request
  const r = await fetch(url.toString(), { cache: 'no-store' });
  if (!r.ok) return null;
  return (await r.json()) as T;
}

async function writeBlobJson(key: string, value: unknown) {
  const token =
    process.env.BLOB_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error('No Blob write token');
  await put(k(key), JSON.stringify(value), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    token,
  });
}

// Existing detail helpers
export async function readMemory(id: string, opts?: { forceFresh?: boolean }) {
  return await readBlobJson<MemoryDetail>(`memories/${id}.json`, opts);
}

export async function writeMemory(doc: MemoryDetail) {
  const payload = { ...doc, updated_at: new Date().toISOString() };
  await writeBlobJson(`memories/${doc.id}.json`, payload);
}

export async function deleteMemory(id: string) {
  const token =
    process.env.BLOB_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error('No Blob write token');
  await del(k(`memories/${id}.json`), { token }).catch(() => {});
  await del(k(`${INDEX_ITEM_PREFIX}/${id}.json`), { token }).catch(() => {});
}

// ✅ New: per-item index summaries
export async function writeIndexItem(item: MemoryIndexItem) {
  await writeBlobJson(`${INDEX_ITEM_PREFIX}/${item.id}.json`, item);
}

export async function aggregateIndex(opts?: { forceFresh?: boolean }) {
  const token =
    process.env.BLOB_READ_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return [] as MemoryIndexItem[];

  // List items
  const all: MemoryIndexItem[] = [];
  let cursor: string | undefined;

  do {
    const { blobs, cursor: next } = await list({
      prefix: k(`${INDEX_ITEM_PREFIX}/`),
      cursor,
      token,
    });
    cursor = next || undefined;

    // Fetch each JSON with a concurrency cap
    const chunk = await Promise.all(
      blobs.map(async (b) => {
        const u = new URL(b.downloadUrl);
        if (opts?.forceFresh) u.searchParams.set('cb', Date.now().toString());
        const r = await fetch(u.toString(), { cache: 'no-store' });
        if (!r.ok) return null;
        return (await r.json()) as MemoryIndexItem;
      })
    );

    for (const x of chunk) if (x) all.push(x);
  } while (cursor);

  // Sort newest first (ISO date)
  all.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return all;
}
