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
  const containerClassName =
    `${fullWidth ? 'w-full px-2' : 'max-w-4xl mx-auto px-2'} ${String(className || '')}`.trim();

  return <section className={containerClassName}>{children}</section>;
}
