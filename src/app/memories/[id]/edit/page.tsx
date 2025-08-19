import { notFound } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import { serverFetch } from '@/lib/utils';
import CreateMemoryForm from '@/components/CreateMemoryForm';
import type { MemoryDetail } from '@/types/memory';

// Make this page dynamic to avoid build-time API calls
export const dynamic = 'force-dynamic';

async function getMemory(id: string): Promise<MemoryDetail> {
  const res = await serverFetch(`/api/memory/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Not found');
  }
  return res.json();
}

export default async function EditMemoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const memory = await getMemory(id);
    const displayTitle = memory.title || memory.name;

    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-2">Edit Memory</h1>
            <p className="text-gray-600">Update your memory "{displayTitle}"</p>
          </div>

          <CreateMemoryForm memory={memory} />
        </div>
      </PageContainer>
    );
  } catch (error) {
    console.error('Error loading memory for editing:', error);
    notFound();
  }
}
