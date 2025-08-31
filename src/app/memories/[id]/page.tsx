import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cldUrl } from '@/lib/cloudinary';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import { serverFetch } from '@/lib/utils';
import PhotoGrid from '@/components/PhotoGrid';
import MemoryActions from '@/components/MemoryActions';
import MemoryMetadata from '@/components/MemoryMetadata';
import LinkifiedText from '@/components/LinkifiedText';
import MemoryPageClient from './MemoryPageClient';

import type { MemoryDetail } from '@/types/memory';

// Make this page dynamic to avoid build-time API calls
export const dynamic = 'force-dynamic';

async function getMemory(id: string, t?: string): Promise<MemoryDetail> {
  console.log('getMemory: Fetching memory with ID:', id, 't:', t);
  const url = t ? `/api/memory/${id}?t=${t}` : `/api/memory/${id}`;
  const res = await serverFetch(url, {
    cache: 'no-store',
  });
  console.log('getMemory: Response status:', res.status);
  if (!res.ok) {
    console.log('getMemory: Response not ok, throwing error');
    throw new Error('Not found');
  }
  const data = await res.json();
  console.log('getMemory: Successfully fetched memory:', data.id);
  return data;
}

export default async function MemoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ t?: string; showThanks?: string }>;
}) {
  const { id } = await params;
  const params2 = await searchParams;
  const t = params2?.t;
  const showThanks = params2?.showThanks === 'true';
  console.log(
    'MemoryPage: Attempting to load memory with ID:',
    id,
    't:',
    t,
    'showThanks:',
    showThanks
  );

  try {
    const memory = await getMemory(id, t);
    console.log('MemoryPage: Successfully loaded memory:', memory.id);
    const displayTitle = memory.title || memory.name;

    return (
      <MemoryPageClient
        memory={memory}
        showThanks={showThanks}
        timestamp={t || memory.updated_at}
      />
    );
  } catch (error) {
    console.error('MemoryPage: Error loading memory:', error);
    notFound();
  }
}
