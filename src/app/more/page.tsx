import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import { SimpleHero } from '@/components/Hero';
import { Metadata } from 'next';
import LinkPreview from '@/components/LinkPreview';
import GoFundMeEmbed from '@/components/GoFundMeEmbed';

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
          objectPosition="center 25%"
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

        <div className="space-y-12">
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span>💝</span>
              Donate
            </h2>
            <p className="text-sm text-gray-500">
              Support Paul's family and ease the burden of funeral and
              hospitalization costs.
            </p>
            <p>
              <a
                className="link underline"
                href="https://gofundme.com/f/paul-bedrosian"
                target="_blank"
              >
                Paul's GoFundMe
              </a>
            </p>
            <GoFundMeEmbed />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span>🔗</span>
              Links
            </h2>
            <p className="text-sm text-gray-500">
              A collection of articles or other online tributes to Paul.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <LinkPreview
                url="https://www.jwsfh.com/obituary/paul-bedrosian"
                title="Obituary"
                description="Official obituary from J.W. Smith Funeral Home"
                icon="📰"
                imageKey="PAUL_OBIT"
              />
              <LinkPreview
                url="https://motifri.com/obit-pauly-danger/"
                title="Motif Magazine"
                description="Local arts and culture magazine tribute to Paul"
                icon="🎵"
                imageKey="HERO_IMAGE_DJ"
              />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span>📅</span>
              Upcoming Events
            </h2>
            <p className="text-sm text-gray-500">
              Celebrations and gatherings in Paul's memory.{' '}
              <a
                href="mailto:contact@paulbedrosian.com"
                className="text-[#184a86] hover:text-[#0d3669] transition-colors underline"
              >
                Get in touch
              </a>{' '}
              if you know of any others!
            </p>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-semibold text-gray-900">
                  Pauly Danger Celebration of Life Fest
                </h3>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-semibold w-16 flex-shrink-0">
                    Where:
                  </span>
                  <a
                    className="font-semibold underline text-[#184a86] hover:text-[#0d3669] transition-colors"
                    href="https://theparlourri.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    The Parlour
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold w-16 flex-shrink-0">
                    When:
                  </span>
                  <span>September 20, 2025 (Time TBA)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold w-16 flex-shrink-0">
                    Details:
                  </span>
                  <span>TBA</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold w-16 flex-shrink-0">
                    Contact:
                  </span>
                  <a
                    className="font-semibold underline text-[#184a86] hover:text-[#0d3669] transition-colors"
                    href="https://www.facebook.com/gregory.rourke"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Gregory T Rourke
                  </a>
                </div>
                <p className="pt-3">
                  <a
                    className="link underline text-[#184a86] hover:text-[#0d3669] transition-colors"
                    href="https://www.facebook.com/share/p/1B2VprT8tJ/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Facebook Event →
                  </a>
                </p>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span>📄</span>
              Downloads
            </h2>
            <p className="text-sm text-gray-500">
              High-resolution flyers that were shared at the wake, ready to
              print.
            </p>
            <div className="flex flex-row gap-4">
              <p className="flex flex-col gap-3 items-center">
                <a
                  className="link underline text-[#184a86] hover:text-[#0d3669] transition-colors"
                  href="/downloads/pauly-danger-flyer-front.pdf"
                  target="_blank"
                  download
                >
                  Flyer (front) PDF
                </a>
                <a
                  className="link underline text-[#184a86] hover:text-[#0d3669] transition-colors"
                  href="/downloads/pauly-danger-flyer-front.pdf"
                  target="_blank"
                  download
                >
                  <img
                    src="https://res.cloudinary.com/aborstein/image/upload/v1755736202/Paul/flyer-front.jpg"
                    alt="Flyer (front)"
                    width={160}
                  />
                </a>
              </p>
              <p className="flex flex-col gap-3 items-center">
                <a
                  className="link underline text-[#184a86] hover:text-[#0d3669] transition-colors"
                  href="/downloads/pauly-danger-flyer-back.pdf"
                  target="_blank"
                  download
                >
                  Flyer (back) PDF
                </a>
                <a
                  className="link underline text-[#184a86] hover:text-[#0d3669] transition-colors"
                  href="/downloads/pauly-danger-flyer-back.pdf"
                  target="_blank"
                  download
                >
                  <img
                    src="https://res.cloudinary.com/aborstein/image/upload/v1755736202/Paul/flyer-back.jpg"
                    alt="Flyer (back)"
                    width={160}
                  />
                </a>
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span>🎵</span>
              Music
            </h2>
            <p className="text-sm text-gray-500">
              Playlists and music celebrating Paul's life — more to come!
            </p>
            <p>
              <a
                className="link underline"
                href="https://open.spotify.com/playlist/3gHF1zFYgbVp57ELWZRLhT?si=G9UmxK1dR9m37miRbZpdYQ"
                target="_blank"
              >
                Spotify Playlist
              </a>
            </p>
            <iframe
              data-testid="embed-iframe"
              style={{ borderRadius: '12px' }}
              src="https://open.spotify.com/embed/playlist/3gHF1zFYgbVp57ELWZRLhT?utm_source=generator"
              width="380"
              height="352"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>
            <p>
              <a
                className="link underline"
                href="https://open.spotify.com/playlist/00000000000000000000000000000000?si=0000000000000000"
                target="_blank"
              >
                Upsetta Tribute Album
              </a>
            </p>
            <p className="text-gray-500 text-sm">COMING SOON</p>
          </section>

          <section className="flex flex-col gap-3 pb-12">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span>📧</span>
              Contact
            </h2>
            <p className="text-sm text-gray-500">
              Did we miss anything? Have any feedback or questions?
            </p>
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
