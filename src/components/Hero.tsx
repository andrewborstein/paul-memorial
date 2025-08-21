import { CLOUDINARY_IMAGES } from '@/lib/constants';
import { getHeroImageUrl } from '@/lib/cloudinary';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="w-screen -ml-2 -mr-4 -mt-8 pb-8 pr-2">
      <Image
        src={getHeroImageUrl(CLOUDINARY_IMAGES.HERO_IMAGE_PHOTO)}
        alt="Paul Bedrosian Memorial"
        width={1920}
        height={1080}
        className="w-screen h-auto object-contain max-w-none"
        priority
        sizes="100vw"
      />
    </section>
  );
}
