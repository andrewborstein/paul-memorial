import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import Hero from '@/components/Hero';

export default async function HomePage() {
  try {
    return (
      <>
        <Hero />
        <PageContainer>
          <PageHeader
            title="Remembering Paul"
            description={
              <p className="flex flex-col gap-4">
                <p>
                  Paul Nshan Bedrosian was a devoted father, partner, son,
                  brother, and friend whose kindness touched countless lives.
                  His young son, Olì, will grow up without the chance to know
                  him firsthand — so our task now is to capture Paul's life
                  through the stories, photos, and memories we share.{' '}
                </p>
                <p>
                  From his roots in Cranston to his years in Vermont, from
                  family spread across the world to friends in Providence's
                  nightlife and beyond, each perspective adds another side to
                  who he was. Paul's spirit will live on in what we collect
                  together, giving Oli, and all of us, a lasting picture of the
                  life he made so full.
                </p>
              </p>
            }
          />

          <div className="text-center mb-8">
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
