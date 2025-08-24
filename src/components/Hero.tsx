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
