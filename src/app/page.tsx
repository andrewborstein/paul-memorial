import PageContainer from '@/components/PageContainer';

export default function Home() {
  return (
    <PageContainer>
      <div className="prose max-w-none">
        <h1>In Memory of Paul Bedrosian</h1>
        <p>
          This site is a home for stories, photos, and memories shared by
          friends and family.
        </p>
        <p>
          Please visit the <a href="/memories">Memories</a> page to share a note
          or story, and <a href="/photos">Photos</a> to browse photos.
        </p>
        <p>
          For the obituary and funeral information, please visit{' '}
          <a
            href="https://www.legacy.com/us/obituaries/name/paul-bedrosian-obituary"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            the obituary page
          </a>
          .
        </p>
      </div>
    </PageContainer>
  );
}
