import { Metadata } from 'next';
import MemoriesPageClient from './MemoriesPageClient';

export const metadata: Metadata = {
  title: 'Memories • Remembering Paul',
  description:
    "Read and share reflections on Paul's life. Every story, big or small, helps build a collective portrait for his family, friends, and son, Ólì.",
  alternates: { canonical: '/memories' },
};

export default function MemoriesPage() {
  return <MemoriesPageClient />;
}
