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
    `px-4 ${fullWidth ? 'w-full' : 'max-w-4xl mx-auto '} ${String(className || '')}`.trim();

  return <section className={containerClassName}>{children}</section>;
}
