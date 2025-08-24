import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import Hero from '@/components/Hero';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Remembering Paul Bedrosian',
  description:
    'A memorial to Paul Nshan Bedrosian. Share stories, photos, and memories to help keep his legacy alive.',
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  try {
    return (
      <>
        <PageContainer>
          <Hero />
          <PageHeader
            title="Remembering Paul"
            description={
              <div className="flex flex-col gap-4">
                <p>
                  Paul Nshan Bedrosian was a devoted father, partner, son,
                  brother, and friend whose kindness touched countless lives.
                  His young son, Olì, will grow up without the chance to know
                  him firsthand. By sharing our stories, photos, and memories,
                  we give Olì — and one another — the gift of knowing Paul more
                  fully than any one person could give alone.
                </p>
                <p>
                  From his roots in Cranston to his years in Vermont, from
                  family spread across the world to friends from Providence's
                  nightlife and beyond, each perspective adds another dimension
                  to his legacy. Together, these contributions form a living
                  portrait of Paul's life, one that will continue to grow as
                  more memories are shared. Thank you for keeping Paul's memory
                  alive.
                </p>
              </div>
            }
          />

          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/memories/new" className="btn">
                Share a memory
              </Link>
              <Link href="/memories" className="btn-secondary">
                View all memories
              </Link>
            </div>
          </div>
        </PageContainer>
      </>
    );
  } catch (error) {
    console.error('Error loading home page:', error);
    return (
      <>
        <Hero />
        <PageContainer>
          <PageHeader
            title="Paul Bedrosian Memorial"
            description="A place to share memories, photos, and stories about Paul. Help us celebrate his life and the impact he had on all of us."
          />
          <div className="text-center py-12">
            <p className="text-stone-600">
              Unable to load recent memories at this time.
            </p>
          </div>
        </PageContainer>
      </>
    );
  }
}
