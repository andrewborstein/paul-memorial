import { list, put, del, ListBlobResult } from '@vercel/blob';
import { randomUUID } from 'crypto';
import type { MemoryDetail, MemoryIndexItem } from '@/types/memory';

const BLOB_PREFIX = process.env.BLOB_PREFIX || '';
const INDEX_ITEM_PREFIX = 'index-items';
const REDIRECT_PREFIX = 'redirects'; // oldId -> newId pointer

const k = (key: string) => (BLOB_PREFIX ? `${BLOB_PREFIX}/${key}` : key);

type BlobFile = { pathname: string; downloadUrl: string };
type Page = { blobs: BlobFile[]; cursor?: string };

export async function readBlobJson<T>(
  key: string,
  opts?: { forceFresh?: boolean; cb?: string; updated_at?: string }
): Promise<T | null> {
  const token =
    process.env.BLOB_READ_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return null;

  const target = k(key);
  let cursor: string | undefined;
  let file: BlobFile | undefined;

  do {
    const page: ListBlobResult = await list({ prefix: target, cursor, token });
    file = page.blobs.find((b) => b.pathname === target);
    cursor = page.cursor || undefined;
  } while (!file && cursor);

  if (!file) return null;

  const url = new URL(file.downloadUrl);
  const cb =
    opts?.cb ||
    opts?.updated_at ||
    (opts?.forceFresh ? Date.now().toString() : '');
  if (cb) url.searchParams.set('cb', cb);

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
export async function readMemory(
  id: string,
  opts?: { forceFresh?: boolean; updated_at?: string }
) {
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

export async function deleteMemoryAndIndex(id: string) {
  const token =
    process.env.BLOB_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error('No Blob write token');
  await del(k(`memories/${id}.json`), { token }).catch(() => {});
  await del(k(`${INDEX_ITEM_PREFIX}/${id}.json`), { token }).catch(() => {});
}

export async function createMemory(
  doc: Omit<MemoryDetail, 'id' | 'created_at' | 'updated_at'> & {
    created_at?: string;
  }
) {
  const id = randomUUID();
  const now = new Date().toISOString();
  const payload: MemoryDetail = {
    ...doc,
    id,
    created_at: doc.created_at ?? now,
    updated_at: now,
  };
  await writeBlobJson(`memories/${id}.json`, payload);

  const indexItem: MemoryIndexItem = {
    id,
    title: payload.title,
    name: payload.name,
    email: payload.email,
    body: payload.body?.length
      ? payload.body.length > 200
        ? payload.body.slice(0, 200).trim() + '…'
        : payload.body
      : '',
    created_at: payload.created_at,
    updated_at: payload.updated_at,
    photo_count: payload.photos?.length ?? 0,
    cover_public_id: payload.photos?.[0]?.public_id,
  };
  await writeIndexItem(indexItem);

  return payload;
}

export async function immutableUpdateMemory(
  oldId: string,
  changes: Partial<MemoryDetail>
) {
  // read the old doc (fresh) to keep created_at
  const oldDoc = await readBlobJson<MemoryDetail>(`memories/${oldId}.json`, {
    forceFresh: true,
  });
  if (!oldDoc) throw new Error('Old memory not found');

  const { id, created_at, updated_at, ...oldDocWithoutIds } = oldDoc;
  const newDoc = await createMemory({
    ...oldDocWithoutIds,
    ...changes,
    created_at: oldDoc.created_at, // preserve
  });

  // optional: write a redirect pointer oldId -> newId
  await writeBlobJson(`${REDIRECT_PREFIX}/${oldId}.json`, {
    id: newDoc.id,
    updated_at: newDoc.updated_at,
  });

  // remove old artifacts
  await deleteMemoryAndIndex(oldId);

  return newDoc;
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
  all.sort((a, b) =>
    a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0
  );
  return all;
}
