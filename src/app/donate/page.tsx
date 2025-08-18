import PageContainer from '@/components/PageContainer';

export default function Donate() {
  return (
    <PageContainer>
      <div className="prose max-w-none">
        <h1>Donate</h1>
        <p>
          <a className="btn" href="https://gofundme.com/" target="_blank">
            Go to GoFundMe
          </a>
        </p>
      </div>
    </PageContainer>
  );
}
