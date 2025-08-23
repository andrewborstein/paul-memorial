import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';

export default function NotFound() {
  return (
    <PageContainer>
      <PageHeader
        title="Page Not Found"
        description="The page you're looking for doesn't exist."
      />

      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Return to home
        </Link>
      </div>
    </PageContainer>
  );
}
