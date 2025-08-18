'use client';
import Link from 'next/link';
import CreateMemoryForm from '@/components/CreateMemoryForm';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';

export default function NewMemoryPage() {
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
          <li className="text-gray-600 font-semibold">Share a memory</li>
        </ol>
      </nav>

      <PageHeader
        title="Share a memory"
        description="Share a note, photos, or both. This can include condolences, memories, stories, or messages of support."
      />

      <CreateMemoryForm />
    </PageContainer>
  );
}
