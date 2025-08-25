import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {item.href ? (
              <Link
                href={item.href}
                className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-600 font-medium whitespace-nowrap">
                {item.label}
              </span>
            )}
            {index < items.length - 1 && (
              <span className="text-gray-400 ml-2 whitespace-nowrap">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
