'use client';
import Link from 'next/link';
import CreateMemoryForm from '@/components/CreateMemoryForm';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import PhotoReelHero from '@/components/PhotoReelHero';

export default function NewMemoryPage() {
  return (
    <>
      <PhotoReelHero />
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
          description="Whether it's a funny story, a favorite photo, or a simple reflection, your memory of Paul matters. By sharing, you help weave a living tribute that will comfort and inspire his family and friends for years to come."
        />

        <CreateMemoryForm />
      </PageContainer>
    </>
  );
}
