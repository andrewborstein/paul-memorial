import { Metadata } from 'next';
import MemoriesPageClient from './MemoriesPageClient';

export const metadata: Metadata = {
  title: 'Memories • Paul Bedrosian',
  description:
    "Read and share reflections on Paul's life. Every story, big or small, helps build a collective portrait for his family, friends, and son, Olì.",
  alternates: { canonical: '/memories' },
};

export default function MemoriesPage() {
  return <MemoriesPageClient />;
}
