import 'server-only';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { MemoryDetail, MemoryIndexItem } from '@/types/memory';
import { saveMemoryToRepo, deleteFileFromRepo } from './github-writer';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const MEMORIES_DIR = path.join(DATA_DIR, 'memories');
const REDIRECTS_DIR = path.join(DATA_DIR, 'redirects');

// Ensure directories exist
// Note: In Next.js edge/serverless, writing to FS might not persist, but useful for dev/build
if (process.env.NODE_ENV === 'development' && !fs.existsSync(MEMORIES_DIR)) {
  fs.mkdirSync(MEMORIES_DIR, { recursive: true });
}
if (process.env.NODE_ENV === 'development' && !fs.existsSync(REDIRECTS_DIR)) {
  fs.mkdirSync(REDIRECTS_DIR, { recursive: true });
}

/** Thrown when a memory could not be persisted to the Git store. */
export class MemoryStorageError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'MemoryStorageError';
  }
}

// Memory cache (in-memory, per lambda instance)
const memoryCache = new Map<
  string,
  { data: MemoryDetail; timestamp: number }
>();
const CACHE_TTL = 60 * 1000; // 1 minute

function invalidateMemoryCache(id: string) {
  memoryCache.delete(id);
}

// Helper to read JSON file
async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return null;
  }
}

// Keep this generic function for compatibility if used elsewhere (e.g. user.ts)
export async function readBlobJson<T>(
  key: string,
  opts?: any
): Promise<T | null> {
  // Map blob keys to local paths
  // key: "memories/xyz.json" -> src/data/memories/xyz.json
  // key: "users.json" -> src/data/users.json
  const parts = key.split('/');
  const filename = parts.pop();
  const dir = parts.length > 0 ? parts.join(path.sep) : '';
  const filePath = path.join(DATA_DIR, dir, filename!);

  return readJsonFile<T>(filePath);
}

// Write generic (local only usually, or user.ts uses it)
export async function writeBlobJson(key: string, value: unknown) {
  const parts = key.split('/');
  const filename = parts.pop();
  const dir = parts.length > 0 ? parts.join(path.sep) : '';
  const fullDir = path.join(DATA_DIR, dir);
  if (!fs.existsSync(fullDir))
    await fs.promises.mkdir(fullDir, { recursive: true });

  const filePath = path.join(fullDir, filename!);
  await fs.promises.writeFile(filePath, JSON.stringify(value, null, 2));
}

export async function readMemory(
  id: string,
  opts?: { forceFresh?: boolean; updated_at?: string }
) {
  if (!opts?.forceFresh) {
    const cached = memoryCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  const filePath = path.join(MEMORIES_DIR, `${id}.json`);
  const data = await readJsonFile<MemoryDetail>(filePath);

  if (data) {
    memoryCache.set(id, { data, timestamp: Date.now() });
  }

  return data;
}

export async function aggregateIndex(opts?: { forceFresh?: boolean }) {
  try {
    // In production, files should exist if built correctly
    // If running in Vercel Function, reading ./src/data might work if included in assets
    // Next.js implicitly includes imported files, but dynamic fs reading might miss them
    // Users might need to ensure 'src/data' is included in build output

    if (!fs.existsSync(MEMORIES_DIR)) return [];

    const files = await fs.promises.readdir(MEMORIES_DIR);
    const validFiles = files.filter((f) => f.endsWith('.json'));

    const memories = await Promise.all(
      validFiles.map(async (file) => {
        const data = await readJsonFile<MemoryDetail>(
          path.join(MEMORIES_DIR, file)
        );
        if (!data) return null;

        // Convert Detail to IndexItem
        return {
          id: data.id,
          title: data.title,
          name: data.name,
          email: data.email,
          body: data.body || '',
          created_at: data.created_at,
          updated_at: data.updated_at,
          photo_count: data.photos?.length ?? 0,
          cover_public_id: data.photos?.[0]?.public_id,
        } as MemoryIndexItem;
      })
    );

    const all = memories.filter((m): m is MemoryIndexItem => m !== null);

    // Sort newest first
    all.sort((a, b) =>
      a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0
    );
    return all;
  } catch (err) {
    console.error('Error Aggregating Index:', err);
    return [];
  }
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

  // 1. Write locally (for dev / immediate feedback loop if filesystem allows)
  try {
    if (!fs.existsSync(MEMORIES_DIR))
      await fs.promises.mkdir(MEMORIES_DIR, { recursive: true });
    const filename = `${id}.json`;
    await fs.promises.writeFile(
      path.join(MEMORIES_DIR, filename),
      JSON.stringify(payload, null, 2)
    );
  } catch (e) {
    console.warn(
      'Could not write to local filesystem (expected in Vercel Prod)',
      e
    );
  }

  // 2. Commit to GitHub (Persistent storage)
  const filename = `${id}.json`;
  try {
    await saveMemoryToRepo(filename, payload);
  } catch (e) {
    console.error('Failed to save to GitHub:', e);
    // Throwing error might be good to alert user, but if FS worked (in dev), maybe not?
    // In prod, if GitHub fails, data is lost.
    throw new MemoryStorageError('Failed to save memory to GitHub', {
      cause: e,
    });
  }

  invalidateMemoryCache(id);
  return payload;
}

export async function deleteMemory(id: string) {
  const fileName = `${id}.json`;

  // Local delete (always try). The deployment filesystem is read-only on
  // Vercel, so this throws EROFS in production even though the file is right
  // there in the bundle -- same reason createMemory guards its local write.
  // Left unguarded, it aborted before the GitHub delete below ever ran, so
  // deletes 500'd and edits left the old memory behind as a duplicate.
  try {
    const filePath = path.join(MEMORIES_DIR, fileName);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (e) {
    console.warn(
      'Could not delete from local filesystem (expected in Vercel Prod)',
      e
    );
  }

  // GitHub is the real store, so a failure here means nothing was deleted.
  try {
    await deleteFileFromRepo(fileName);
  } catch (e) {
    console.error('Failed to delete from GitHub:', e);
    throw new MemoryStorageError(`Failed to delete ${fileName} from GitHub`, {
      cause: e,
    });
  }

  invalidateMemoryCache(id);
}

export async function deleteMemoryAndIndex(id: string) {
  await deleteMemory(id);
}
export async function deleteRedirect(id: string) {
  try {
    const filePath = path.join(REDIRECTS_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
  } catch (e) {
    console.warn('Could not delete redirect locally (read-only in prod)', e);
  }

  try {
    await deleteFileFromRepo(`../redirects/${id}.json`);
  } catch (e) {
    console.warn('Could not delete redirect from GitHub:', e);
  }
}
// This function was used for "Edit" - moving to new ID
export async function immutableUpdateMemory(
  oldId: string,
  changes: Partial<MemoryDetail>
) {
  const oldDoc = await readMemory(oldId, { forceFresh: true });
  if (!oldDoc) throw new Error('Old memory not found');

  const {
    id: _id,
    created_at: _created_at,
    updated_at: _updated_at,
    ...oldDocWithoutIds
  } = oldDoc;

  // Create new
  const newDoc = await createMemory({
    ...oldDocWithoutIds,
    ...changes,
    created_at: changes.created_at || oldDoc.created_at,
  });

  // Write redirect
  try {
    if (!fs.existsSync(REDIRECTS_DIR))
      await fs.promises.mkdir(REDIRECTS_DIR, { recursive: true });
    const redirectPath = path.join(REDIRECTS_DIR, `${oldId}.json`);
    await fs.promises.writeFile(
      redirectPath,
      JSON.stringify(
        {
          id: newDoc.id,
          updated_at: newDoc.updated_at,
        },
        null,
        2
      )
    );
  } catch (e) {}

  // Redirect old id -> new id, so links shared before the edit keep working.
  try {
    await saveMemoryToRepo(`../redirects/${oldId}.json`, {
      id: newDoc.id,
      updated_at: newDoc.updated_at,
    });
  } catch (e) {
    // Not fatal -- the edit itself succeeded -- but the old URL will 404.
    console.error('Failed to write redirect for edited memory:', oldId, e);
  }

  // Delete old. If this fails the edit still stands, and reporting failure
  // here would only tempt a retry, which creates another duplicate.
  try {
    await deleteMemory(oldId);
  } catch (e) {
    console.error(
      'Edited memory but could not remove the original -- duplicate left behind:',
      oldId,
      e
    );
  }

  return newDoc;
}

export async function writeIndexItem(item: MemoryIndexItem) {
  // No-op
}
