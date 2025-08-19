import { serverFetch } from '@/lib/utils';
import MemoriesPageClient from './MemoriesPageClient';
import type { MemoryIndexItem } from '@/types/memory';

// Force dynamic rendering and disable all caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getMemories(): Promise<MemoryIndexItem[]> {
  const res = await serverFetch('/api/memories', {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function MemoriesPage() {
  try {
    const memories = await getMemories();
    return <MemoriesPageClient memories={memories} />;
  } catch (error) {
    console.error('Error loading memories page:', error);
    return <MemoriesPageClient memories={[]} />;
  }
}
