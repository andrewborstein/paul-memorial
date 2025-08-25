import { Metadata } from 'next';
import NewMemoryPageClient from './NewMemoryPageClient';

export const metadata: Metadata = {
  title: 'Share a Memory • Remembering Paul',
  description:
    'What will you remember about Paul? Add your story, photo, or reflection to help create a lasting tribute for his family and son, Olì.',
  alternates: { canonical: '/new-memory' },
};

export default function NewMemoryPage() {
  return <NewMemoryPageClient />;
}
