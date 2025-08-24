import Link from 'next/link';
import ImageWithFallback from './ImageWithFallback';
import SquareThumb from './SquareThumb';

interface Photo {
  public_id: string;
  caption?: string;
}

interface PhotoGridProps {
  photos: Photo[];
  memoryId?: string; // Optional for backward compatibility
}

export default function PhotoGrid({ photos, memoryId }: PhotoGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {photos.map((photo) => (
        <Link
          key={photo.public_id}
          href={
            memoryId
              ? `/memories/${memoryId}/photos/${photo.public_id}`
              : `/memories/photos/${photo.public_id}`
          }
          className="aspect-square overflow-hidden rounded-lg group cursor-pointer border border-gray-200 bg-gray-50 relative"
        >
          <SquareThumb
            publicId={photo.public_id}
            alt={photo.caption || 'Photo'}
            className="overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {photo.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              {photo.caption}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
