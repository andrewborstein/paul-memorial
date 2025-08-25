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
                We each had a unique window into his life. Whether funny,
                heartfelt, or ordinary, your memory of Paul matters. By sharing,
                you help weave a living tribute that will comfort and inspire
                his family and give Ólì a richer sense of the father he never
                got to know.
              </p>
              <p>
                <details>
                  <summary>
                    <span className="font-semibold underline text-[#184a86]">
                      Suggestions for writing a good memory
                    </span>
                  </summary>
                  <ul className="list py-4 space-y-2">
                    <li>
                      <span className="font-semibold">
                        Tell us how you know Paul.
                      </span>{' '}
                      E.g. how you met and how long you've known each other. It
                      will be helpful to readers in the future, including Óli.
                    </li>
                    <li>
                      <span className="font-semibold">
                        Include specific details.
                      </span>{' '}
                      A conversation you had, an activity you shared, something
                      you witnessed, a message you received — any small moment
                      that revealed who he was.
                    </li>
                    <li>
                      <span className="font-semibold">
                        It doesn't need to be exhaustive.
                      </span>{' '}
                      Feel free to write one very short or very long memory, or
                      make it a series of memories.
                    </li>
                    <li>
                      <span className="font-semibold">
                        Don't worry about making it perfect.
                      </span>{' '}
                      You can edit or delete it after you publish, or come back
                      and contribute more over time.
                    </li>
                    <li>
                      <span className="font-semibold">
                        Photo albums are great, too.
                      </span>{' '}
                      Add photos to your memory or create a separate "album"
                      memory with a title and description of the photos.
                    </li>
                  </ul>
                </details>
              </p>
            </div>
          }
        />

        <CreateMemoryForm />
      </PageContainer>
    </>
  );
}
