interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  visuallyHidden?: boolean;
}

export default function PageHeader({
  title,
  description,
  children,
  visuallyHidden = false,
}: PageHeaderProps) {
  return (
    <div className={`mb-6 ${visuallyHidden ? 'sr-only' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {children}
      </div>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  );
}
