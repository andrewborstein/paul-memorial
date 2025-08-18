import Link from 'next/link';
import ImageWithFallback from './ImageWithFallback';

interface Photo {
  public_id: string;
  caption?: string;
}

interface PhotoGridProps {
  photos: Photo[];
}

export default function PhotoGrid({ photos }: PhotoGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {photos.map((photo) => (
                          <Link
                    key={photo.public_id}
                    href={`/memories/photos/${photo.public_id}`}
                    className="aspect-square overflow-hidden rounded-lg group cursor-pointer border border-gray-200 bg-gray-50 relative"
                  >
                    <ImageWithFallback
                      publicId={photo.public_id}
                      alt={photo.caption || 'Photo'}
                      className="w-full h-full object-cover"
                      width={400}
                      quality={70}
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
