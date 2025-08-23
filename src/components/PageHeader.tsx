interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
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
        <h1 className="text-4xl font-semibold text-[#184a86]">{title}</h1>
        {children}
      </div>
      {description && <p className="text-stone-600">{description}</p>}
    </div>
  );
}
