import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import PhotoReelHero from '@/components/PhotoReelHero';

export default function MemorySuccessPage() {
  return (
    <>
      <PhotoReelHero />
      <PageContainer>
        <div className="max-w-2xl mx-auto py-12 text-center">
          <PageHeader
            title="Thanks for your contribution"
            description={
              <div className="space-y-8 text-lg text-gray-700">
                <p>
                  Your memory means the world to Paul&apos;s family and loved
                  ones.
                </p>

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
                    It usually takes <strong>1-3 minutes</strong> for the system
                    to process your contribution and display it on the site.
                  </p>
                  <p className="text-sm text-blue-800">
                    Please check back in a few minutes to see your memory
                    published.
                  </p>
                </div>

                <div className="space-y-4 text-base">
                  <p>
                    You can edit or delete the memory and its content (both text
                    and photos) at any time on this device once it appears on
                    the site.
                  </p>
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
