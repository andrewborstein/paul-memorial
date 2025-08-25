import { Metadata } from 'next';
import PhotosPageClient from './PhotosPageClient';

export const metadata: Metadata = {
  title: 'Photos • Remembering Paul',
  description:
    'Browse and contribute photos of Paul. From candid selfies to treasured portraits, every snapshot matters in telling his story.',
  alternates: { canonical: '/photos' },
};

export default function PhotosPage() {
  return <PhotosPageClient />;
}
