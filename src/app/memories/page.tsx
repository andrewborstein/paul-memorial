'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import MemoryMasonry from '@/components/MemoryMasonry';
import type { MemoryIndexItem } from '@/types/memory';

function MemorySkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="h-40 bg-gray-200/60 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 bg-gray-200/60 animate-pulse rounded" />
        <div className="h-3 w-1/2 bg-gray-200/60 animate-pulse rounded" />
      </div>
    </div>
  );
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<MemoryIndexItem[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        const t =
          typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('t')
            : null;

        const url = t
          ? `/api/memories?t=${encodeURIComponent(t)}`
          : '/api/memories';

        const res = await fetch(url, {
          signal: ac.signal,
          cache: 'no-store', // browser cache disabled; edge/API handles caching
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: MemoryIndexItem[] = await res.json();
        setMemories(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (e?.name !== 'AbortError')
          setErr(e?.message ?? 'Failed to load memories');
      }
    })();

    return () => ac.abort();
  }, []);

  const hasMemories = (memories?.length ?? 0) > 0;
  const skeletons = useMemo(() => Array.from({ length: 8 }), []);

  return (
    <>
      <PageContainer>
        <PageHeader
          title="Memories"
          description="Read memories shared by friends and family."
        >
          <Link
            href="/memories/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap flex-shrink-0"
          >
            Share memory
          </Link>
        </PageHeader>

        {err ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Unable to load memories.</p>
            <Link
              href="/memories/new"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Be the first to share a memory
            </Link>
          </div>
        ) : memories === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
            {skeletons.map((_, i) => (
              <MemorySkeleton key={i} />
            ))}
          </div>
        ) : !hasMemories ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No memories shared yet.</p>
            <Link
              href="/memories/new"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Be the first to share a memory
            </Link>
          </div>
        ) : null}
      </PageContainer>

      {hasMemories && (
        <div className="w-full px-2">
          <MemoryMasonry memories={memories!} />
        </div>
      )}
    </>
  );
}
