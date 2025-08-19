import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export default function PageContainer({
  children,
  className = '',
  fullWidth = false,
}: PageContainerProps) {
  return (
    <section
      className={`${fullWidth ? 'w-full px-2' : 'max-w-4xl mx-auto px-2'} ${className}`}
    >
      {children}
    </section>
  );
}
