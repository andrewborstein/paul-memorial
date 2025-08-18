import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({
  children,
  className = '',
}: PageContainerProps) {
  return (
    <section className={`max-w-4xl mx-auto px-2 ${className}`}>
      {children}
    </section>
  );
}
