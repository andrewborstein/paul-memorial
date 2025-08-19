import { notFound } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import { serverFetch } from '@/lib/utils';
import CreateMemoryForm from '@/components/CreateMemoryForm';
import type { MemoryDetail } from '@/types/memory';

// Make this page dynamic to avoid build-time API calls
export const dynamic = 'force-dynamic';

async function getMemory(
  id: string,
  fresh?: boolean,
  t?: string
): Promise<MemoryDetail> {
  const params = new URLSearchParams();
  if (fresh) params.set('fresh', '1');
  if (t) params.set('t', t);

  const url = `/api/memory/${id}${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await serverFetch(url, {
    cache: fresh ? 'no-store' : 'default',
  });
  if (!res.ok) {
    throw new Error('Not found');
  }
  return res.json();
}

export default async function EditMemoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ fresh?: string; t?: string }>;
}) {
  const { id } = await params;
  const { fresh, t } = searchParams ? await searchParams : {};

  try {
    const memory = await getMemory(id, fresh === '1', t);
    const displayTitle = memory.title || memory.name;

    return (
      <PageContainer>
        <PageHeader
          title="Edit Memory"
          description={`Update your memory "${displayTitle}"`}
        />

        <CreateMemoryForm memory={memory} />
      </PageContainer>
    );
  } catch (error) {
    console.error('Error loading memory for editing:', error);
    notFound();
  }
}
