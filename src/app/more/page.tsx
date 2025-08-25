import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import { SimpleHero } from '@/components/Hero';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'More • Remembering Paul',
  description:
    'Find links, events, flyers, playlists, and resources about Paul. To share something for this page, email contact@paulbedrosian.com.',
  alternates: { canonical: '/more' },
};

export default function More() {
  return (
    <>
      <PageContainer>
        <SimpleHero
          imageKey="FLYER_BACK"
          alt="Paul Bedrosian Flyer Back"
          objectPosition="center 27%"
        />
        <PageHeader
          title="More"
          description={
            <>
              Explore more about Paul's life through articles, events, flyers,
              playlists, and other resources. If you'd like to share something
              here, please get in touch at{' '}
              <a
                href="mailto:contact@paulbedrosian.com"
                className="text-[#184a86] hover:text-[#0d3669] transition-colors underline"
              >
                contact@paulbedrosian.com
              </a>
              .
            </>
          }
        />

        <div className="space-y-6">
          <section className="flex flex-col gap-2">
            <h2>Donate</h2>
            <p>
              <a
                className="link underline"
                href="https://gofundme.com/f/paul-bedrosian"
                target="_blank"
              >
                Paul's GoFundMe
              </a>
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2>Links</h2>
            <p>
              <a
                className="link underline"
                href="https://www.jwsfh.com/obituary/paul-bedrosian"
                target="_blank"
              >
                Obituary
              </a>
            </p>
            <p>
              <a
                className="link underline"
                href="https://motifri.com/obit-pauly-danger/"
                target="_blank"
              >
                Motif Magazine
              </a>
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2>Events</h2>
            <p>
              <a className="link underline" href="#" target="_blank">
                Pauly Danger Celebration of Life Fest - The Parlour, 9/20/25
              </a>
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2>Downloads</h2>
            <div className="flex flex-row gap-4">
              <p className="flex flex-col gap-2 items-center">
                <img
                  src="https://res.cloudinary.com/aborstein/image/upload/v1755736202/Paul/flyer-front.jpg"
                  alt="Flyer (front)"
                  width={120}
                />
                <a className="link underline" href="#" target="_blank">
                  Flyer (front)
                </a>
              </p>
              <p className="flex flex-col gap-2 items-center">
                <img
                  src="https://res.cloudinary.com/aborstein/image/upload/v1755736202/Paul/flyer-back.jpg"
                  alt="Flyer (back)"
                  width={120}
                />
                <a
                  className="link underline"
                  href="https://res.cloudinary.com/aborstein/image/upload/v1755736202/Paul/flyer-back.jpg"
                  target="_blank"
                >
                  Flyer (back)
                </a>
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h2>Music</h2>
            <p>
              <a
                className="link underline"
                href="https://open.spotify.com/playlist/00000000000000000000000000000000?si=0000000000000000"
                target="_blank"
              >
                Spotify Playlist
              </a>
            </p>
            <p>
              <a
                className="link underline"
                href="https://open.spotify.com/playlist/00000000000000000000000000000000?si=0000000000000000"
                target="_blank"
              >
                Upsetta Tribute Album COMING SOON
              </a>
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2>Contact</h2>
            <p>
              <a
                className="link underline"
                href="mailto:contact@paulbedrosian.com"
              >
                contact@paulbedrosian.com
              </a>
            </p>
          </section>
        </div>
      </PageContainer>
    </>
  );
}
