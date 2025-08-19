import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cldUrl } from '@/lib/cloudinary';
import PageContainer from '@/components/PageContainer';
import { serverFetch } from '@/lib/utils';
import PhotoGrid from '@/components/PhotoGrid';
import MemoryActions from '@/components/MemoryActions';
import MemoryMetadata from '@/components/MemoryMetadata';

import type { MemoryDetail } from '@/types/memory';

// Make this page dynamic to avoid build-time API calls
export const dynamic = 'force-dynamic';

async function getMemory(
  id: string,
  fresh?: boolean,
  t?: string
): Promise<MemoryDetail> {
  console.log(
    'getMemory: Fetching memory with ID:',
    id,
    'fresh:',
    fresh,
    't:',
    t
  );
  const qs = new URLSearchParams();
  if (fresh) qs.set('fresh', '1');
  if (t) qs.set('t', t);
  const url = qs.toString() ? `/api/memory/${id}?${qs}` : `/api/memory/${id}`;
  const res = await serverFetch(url, {
    cache: fresh ? 'no-store' : 'default',
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
  searchParams?: Promise<{ fresh?: string; t?: string }>;
}) {
  const { id } = await params;
  const params2 = await searchParams;
  const fresh = params2?.fresh === '1';
  const t = params2?.t;
  console.log(
    'MemoryPage: Attempting to load memory with ID:',
    id,
    'fresh:',
    fresh,
    't:',
    t
  );

  try {
    const memory = await getMemory(id, fresh, t);
    console.log('MemoryPage: Successfully loaded memory:', memory.id);
    const displayTitle = memory.title || memory.name;

    return (
      <PageContainer>
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link
                href="/memories"
                className="text-blue-600 hover:text-blue-800"
              >
                Memories
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-600 font-medium">{displayTitle}</li>
          </ol>
        </nav>

        {/* Memory Content */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{displayTitle}</h1>
              <div className="mt-2">
                <MemoryMetadata
                  date={memory.created_at}
                  creatorEmail={memory.email}
                  creatorName={memory.name}
                />
              </div>
            </div>

            {/* Edit/Delete Actions */}
            <MemoryActions memoryId={memory.id} creatorEmail={memory.email} />
          </div>

          {/* Text Content */}
          <div>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {memory.body}
            </p>
          </div>

          {/* Photos */}
          {memory.photos.length > 0 && (
            <div>
              <PhotoGrid photos={memory.photos} />
            </div>
          )}
        </div>
      </PageContainer>
    );
  } catch (error) {
    console.error('MemoryPage: Error loading memory:', error);
    notFound();
  }
}
