import { list, put } from '@vercel/blob';
import type { MemoryDetail, MemoryIndexItem } from '@/types/memory';

const INDEX_KEY = 'index.json';
const BLOB_PREFIX = process.env.BLOB_PREFIX || '';

function getBlobKey(key: string): string {
  return BLOB_PREFIX ? `${BLOB_PREFIX}/${key}` : key;
}

async function readBlobJson<T>(key: string): Promise<T | null> {
  try {
    // Prefer read-only token, fallback to read-write
    const token =
      process.env.BLOB_READ_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.warn('No Blob read token found');
      return null;
    }

    const blobKey = getBlobKey(key);
    console.log('Attempting to read Blob with key:', blobKey);

    const { blobs } = await list({ prefix: blobKey, limit: 1, token });
    console.log('Found blobs:', blobs.length);

    if (blobs.length === 0) {
      console.log('No blobs found for key:', blobKey);
      return null;
    }

    const res = await fetch(blobs[0].downloadUrl);
    if (!res.ok) {
      console.error(
        'Failed to fetch blob content:',
        res.status,
        res.statusText
      );
      return null;
    }

    const data = await res.json();
    console.log('Successfully read blob data for key:', key);
    return data as T;
  } catch (error) {
    console.error('Failed to read from Blob:', error);
    return null;
  }
}

async function writeBlobJson(key: string, value: unknown) {
  // Prefer write token, fallback to read-write
  const token =
    process.env.BLOB_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('No Blob write token found');
  }

  const blobKey = getBlobKey(key);
  await put(blobKey, JSON.stringify(value), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
  });
}

export async function readIndex(): Promise<MemoryIndexItem[]> {
  return (await readBlobJson<MemoryIndexItem[]>(INDEX_KEY)) ?? [];
}

export async function writeIndex(items: MemoryIndexItem[]) {
  await writeBlobJson(INDEX_KEY, items);
}

export async function readMemory(id: string): Promise<MemoryDetail | null> {
  console.log('Attempting to read memory file:', `memories/${id}.json`);
  const result = await readBlobJson<MemoryDetail>(`memories/${id}.json`);
  console.log('Memory read result:', result ? 'found' : 'not found');
  return result;
}

export async function writeMemory(doc: MemoryDetail) {
  console.log('Writing memory to Blob:', `memories/${doc.id}.json`);
  await writeBlobJson(`memories/${doc.id}.json`, doc);
  console.log('Memory written successfully to Blob');
}
