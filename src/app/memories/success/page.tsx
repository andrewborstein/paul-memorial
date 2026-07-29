import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import PhotoReelHero from '@/components/PhotoReelHero';

// Every change -- create, edit, delete -- is published by a rebuild, so none
// of them are visible straight away. Each one lands here so nobody is sent
// back to a page still showing the old version, thinking it didn't work.
const COPY = {
  created: {
    title: 'Thanks for your contribution',
    intro: "Your memory means the world to Paul's family and loved ones.",
    processing: 'to process your contribution and display it on the site.',
    checkBack: 'Please check back in a few minutes to see your memory published.',
  },
  updated: {
    title: 'Your changes are saved',
    intro: 'Thanks for keeping your memory up to date.',
    processing: 'for your changes to appear on the site.',
    checkBack:
      'Until then you may still see the previous version. That is expected.',
  },
  deleted: {
    title: 'Your memory has been removed',
    intro: 'The memory has been deleted and will disappear from the site.',
    processing: 'for the change to take effect across the site.',
    checkBack:
      'Until then it may still appear in the list of memories. That is expected.',
  },
} as const;

type Action = keyof typeof COPY;

export default async function MemorySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  const { action } = await searchParams;
  const copy = COPY[(action as Action) ?? 'created'] ?? COPY.created;
  const isDeleted = action === 'deleted';

  return (
    <>
      <PhotoReelHero />
      <PageContainer>
        <div className="max-w-2xl mx-auto py-12 text-center">
          <PageHeader
            title={copy.title}
            description={
              <div className="space-y-8 text-lg text-gray-700">
                <p>{copy.intro}</p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left space-y-3">
                  <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Processing Time
                  </h3>
                  <p className="text-sm text-blue-800">
                    It usually takes <strong>1-3 minutes</strong> {copy.processing}
                  </p>
                  <p className="text-sm text-blue-800">{copy.checkBack}</p>
                </div>

                <div className="space-y-4 text-base">
                  {!isDeleted && (
                    <p>
                      You can edit or delete the memory and its content (both
                      text and photos) at any time on this device once it
                      appears on the site.
                    </p>
                  )}
                  <p>
                    Email{' '}
                    <a
                      href="mailto:contact@paulbedrosian.com"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      contact@paulbedrosian.com
                    </a>{' '}
                    with any feedback or questions.
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href="/memories"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:text-lg transition-colors"
                  >
                    View all memories
                  </Link>
                </div>
              </div>
            }
          />
        </div>
      </PageContainer>
    </>
  );
}
