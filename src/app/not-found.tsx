'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';

export default function NotFound() {
  const pathname = usePathname();
  const isMemoryPage =
    pathname?.startsWith('/memories/') && pathname.split('/').length === 3;

  const handleRefresh = () => {
    window.location.reload();
  };

  const NOUN = {
    LOWER: isMemoryPage ? 'memory' : 'page',
    TITLE: isMemoryPage ? 'Memory' : 'Page',
  };

  return (
    <PageContainer>
      <PageHeader
        title={`${NOUN.TITLE} not found`}
        description={`The ${NOUN.LOWER} you're looking for could not be found at this address.`}
      />

      <div className="text-center py-12 space-y-8">
        <p className="text-gray-600 mb-4">
          Sorry, we couldn't find the {NOUN.LOWER} you're looking for.{' '}
          {isMemoryPage && (
            <button
              onClick={handleRefresh}
              className="text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Refresh the page to check again.
            </button>
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/memories" className="btn-secondary">
            View all memories
          </Link>
          <Link href="/" className="btn-secondary">
            Return to home
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
