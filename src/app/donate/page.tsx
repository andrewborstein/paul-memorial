import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';

export default function Donate() {
  return (
    <PageContainer>
      <PageHeader
        title="Donate"
        description="Support the memorial fund in Paul's memory."
      />

      <div className="prose max-w-none">
        <p>
          <a className="btn" href="https://gofundme.com/" target="_blank">
            Go to GoFundMe
          </a>
        </p>
      </div>
    </PageContainer>
  );
}
