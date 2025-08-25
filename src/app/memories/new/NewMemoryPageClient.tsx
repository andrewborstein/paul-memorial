'use client';

import Link from 'next/link';
import CreateMemoryForm from '@/components/CreateMemoryForm';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import PhotoReelHero from '@/components/PhotoReelHero';

export default function NewMemoryPageClient() {
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
          description={
            <div className="space-y-4">
              <p className="text-lg font-semibold">
                What will you remember about Paul?
              </p>{' '}
              <p>
                The most meaningful contributions are often the most
                specific—not necessarily the most impressive or entertaining. A
                conversation you had, an activity you shared, something you
                witnessed, a message you received, or any small moment that
                revealed who he was.
              </p>
              <p>
                We each had a unique window into his life. Whether funny,
                heartfelt, or ordinary, your memory of Paul matters. By sharing,
                you help weave a living tribute that will comfort and inspire
                his family and give Ólì a richer sense of the father he never
                got to know.
              </p>
            </div>
          }
        />

        <CreateMemoryForm />
      </PageContainer>
    </>
  );
}
