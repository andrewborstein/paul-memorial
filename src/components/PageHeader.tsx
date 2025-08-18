interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold mb-3">{title}</h1>
      {description && <p className="text-gray-600 mt-2">{description}</p>}
      {children}
    </div>
  );
}
