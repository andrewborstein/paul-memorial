'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import MemoryMasonry from '@/components/MemoryMasonry';
import { SimpleHero } from '@/components/Hero';
import { getCurrentUser, type UserInfo } from '@/lib/user';
import type { MemoryIndexItem } from '@/types/memory';

function MemorySkeleton({ height = 'h-48' }: { height?: string }) {
  return (
    <div className="memory-card w-full mb-6">
      <div className="block bg-white border border-gray-200 rounded-lg p-4">
        {/* Header: Name and date */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="h-4 w-24 bg-gray-200/60 animate-pulse rounded mb-2" />
            <div className="h-3 w-16 bg-gray-200/60 animate-pulse rounded" />
          </div>
          {/* Thumbnail skeleton */}
          <div className="w-12 h-12 rounded-lg bg-gray-200/60 animate-pulse flex-shrink-0 ml-4" />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-3" />

        {/* Title skeleton (sometimes present) */}
        <div className="h-5 w-3/4 bg-gray-200/60 animate-pulse rounded mb-3" />

        {/* Content skeleton with varied heights */}
        <div className="space-y-2">
          <div className={`${height} bg-gray-200/60 animate-pulse rounded`} />
          <div className="h-4 w-1/3 bg-gray-200/60 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}

function MemoriesPageContent() {
  const [memories, setMemories] = useState<MemoryIndexItem[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');

  useEffect(() => {
    // Only run on client side
    const user = getCurrentUser();
    setCurrentUser(user);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleUserUpdate = () => {
      setCurrentUser(getCurrentUser());
    };

    window.addEventListener('userUpdated', handleUserUpdate);
    return () => window.removeEventListener('userUpdated', handleUserUpdate);
  }, []);

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

  // Filter memories if "my" filter is applied
  const filteredMemories = useMemo(() => {
    if (!memories || !isLoaded) return memories;

    if (filter === 'your' && currentUser) {
      return memories.filter((memory) => memory.email === currentUser.email);
    }

    return memories;
  }, [memories, filter, currentUser, isLoaded]);

  const hasFilteredMemories = (filteredMemories?.length ?? 0) > 0;
  const skeletons = useMemo(() => {
    // Create varied skeleton heights to simulate real content
    const heights = [
      'h-32',
      'h-40',
      'h-48',
      'h-56',
      'h-64',
      'h-72',
      'h-32',
      'h-40',
      'h-48',
      'h-56',
      'h-64',
      'h-72',
    ];
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      height: heights[i % heights.length],
    }));
  }, []);

  return (
    <>
      <PageContainer>
        <SimpleHero imageKey="HERO_IMAGE_DJ" alt="Paul DJ'ing" />
        <PageHeader
          title={filter === 'your' ? 'Your memories' : 'Memories'}
          description={
            filter === 'your' ? (
              <>
                Memories you have shared.{' '}
                <Link
                  href="/memories"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all memories
                </Link>
                .
              </>
            ) : (
              'Read the reflections of those who knew Paul—and add your own. Every memory, big or small, helps paint a fuller picture of his life and keeps his spirit close.'
            )
          }
        >
          <Link
            href="/memories/new"
            className="btn whitespace-nowrap flex-shrink-0"
          >
            share a memory
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
        ) : !hasFilteredMemories && memories !== null ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {filter === 'your'
                ? "You haven't shared any memories yet."
                : 'No memories shared yet.'}
            </p>
            <Link
              href="/memories/new"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {filter === 'your'
                ? 'Share your first memory'
                : 'Be the first to share a memory'}
            </Link>
          </div>
        ) : null}
      </PageContainer>

      {memories === null ? (
        <div className="w-full px-2">
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {skeletons.map((skeleton) => (
              <MemorySkeleton key={skeleton.id} height={skeleton.height} />
            ))}
          </div>
        </div>
      ) : hasFilteredMemories ? (
        <div className="w-full px-2">
          <MemoryMasonry memories={filteredMemories!} />
        </div>
      ) : null}
    </>
  );
}

function MemoriesPageSkeleton() {
  const skeletons = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    height: ['h-32', 'h-40', 'h-48', 'h-56', 'h-64', 'h-72'][i % 6],
  }));

  return (
    <>
      <PageContainer>
        <PageHeader title="Memories" description="Loading memories..." />
      </PageContainer>
      <div className="w-full px-2">
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          {skeletons.map((skeleton) => (
            <MemorySkeleton key={skeleton.id} height={skeleton.height} />
          ))}
        </div>
      </div>
    </>
  );
}

export default function MemoriesPage() {
  return (
    <Suspense fallback={<MemoriesPageSkeleton />}>
      <MemoriesPageContent />
    </Suspense>
  );
}
