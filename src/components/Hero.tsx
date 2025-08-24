import { CLOUDINARY_IMAGES } from '@/lib/constants';
import { getHeroImageUrl } from '@/lib/cloudinary';
import Image from 'next/image';

export default function Hero() {
  return (
    <section
      className="relative h-60 sm:h-80 md:h-96 overflow-hidden -ml-4 -mt-8 mb-8"
      style={{
        backgroundImage: `url(${getHeroImageUrl(CLOUDINARY_IMAGES.HERO_IMAGE_TWO_FLAGS)})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center top',
        backgroundSize: '100% 115%',
        width: 'calc(100% + 2rem)',
      }}
    >
      {/* Paul's portrait - always centered */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <Image
          src={getHeroImageUrl(CLOUDINARY_IMAGES.HERO_IMAGE_PAUL)}
          alt="Paul Bedrosian"
          width={351}
          height={341}
          className="h-full w-auto object-contain"
          priority
        />
      </div>
    </section>
  );
}

type SimpleHeroProps = {
  imageKey: keyof typeof CLOUDINARY_IMAGES;
  alt?: string;
  className?: string;
  objectPosition?: string;
};

export function SimpleHero({
  imageKey,
  alt = 'Hero image',
  className = '',
  objectPosition = 'center',
}: SimpleHeroProps) {
  return (
    <section
      className={`h-60 sm:h-80 md:h-96 overflow-hidden -ml-4 -mt-8 pb-8 ${className}`}
      style={{ width: 'calc(100% + 2rem)' }}
    >
      <Image
        src={getHeroImageUrl(CLOUDINARY_IMAGES[imageKey])}
        alt={alt}
        width={872}
        height={384}
        className="w-full h-full object-cover max-w-none"
        style={{ objectPosition }}
        priority
        sizes="100vw"
      />
    </section>
  );
}
