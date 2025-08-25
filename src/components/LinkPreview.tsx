import Image from 'next/image';
import { CLOUDINARY_IMAGES, type CloudinaryImageKey } from '@/lib/constants';

interface LinkPreviewProps {
  url: string;
  title: string;
  description: string;
  icon: string;
  imageKey?: CloudinaryImageKey;
}

export default function LinkPreview({
  url,
  title,
  description,
  icon,
  imageKey,
}: LinkPreviewProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start gap-3">
        {imageKey ? (
          <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
            <Image
              src={`https://res.cloudinary.com/aborstein/image/upload/f_jpg,q_auto,w_128,h_128,c_fill,g_auto/${CLOUDINARY_IMAGES[imageKey]}`}
              alt={title}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
            <span className="text-lg">{icon}</span>
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-600 mb-1">{description}</p>
          <a
            className="link"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read more →
          </a>
        </div>
      </div>
    </div>
  );
}
