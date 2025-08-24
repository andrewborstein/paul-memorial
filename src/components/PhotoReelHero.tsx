'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';

// Array of photo IDs from the banner-images folder
const PHOTO_IDS = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
];

export default function PhotoReelHero() {
  const [startingIndex, setStartingIndex] = useState(0);
  const [row1Photos, setRow1Photos] = useState<number[]>([]);
  const [row2Photos, setRow2Photos] = useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [visiblePhotoCount, setVisiblePhotoCount] = useState(8); // Default for SSR
  const [increment, setIncrement] = useState(8); // Default for SSR
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const [visiblePhotoIndices, setVisiblePhotoIndices] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  // Calculate responsive values and preload images on mount
  useEffect(() => {
    const getVisiblePhotoCount = () => {
      const width = window.innerWidth;
      if (width < 640) return 8; // Mobile: 4 per row × 2 rows
      if (width < 768) return 12; // Small: 6 per row × 2 rows
      if (width < 1024) return 16; // Medium: 8 per row × 2 rows
      if (width < 1280) return 20; // Large: 10 per row × 2 rows
      if (width < 1536) return 24; // XL: 12 per row × 2 rows
      return 32; // 2XL: 16 per row × 2 rows
    };

    const getStartingIndexIncrement = () => {
      const width = window.innerWidth;
      if (width < 640) return 8; // Mobile: 4 per row × 2 rows
      if (width < 768) return 12; // Small: 6 per row × 2 rows
      if (width < 1024) return 16; // Medium: 8 per row × 2 rows
      if (width < 1280) return 20; // Large: 10 per row × 2 rows
      if (width < 1536) return 24; // XL: 12 per row × 2 rows
      return 32; // 2XL: 16 per row × 2 rows
    };

    setVisiblePhotoCount(getVisiblePhotoCount());
    setIncrement(getStartingIndexIncrement());

    // Preload all images
    const preloadImages = async () => {
      const imagePromises = PHOTO_IDS.map((id) => {
        return new Promise<void>((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = `https://res.cloudinary.com/aborstein/image/upload/v1756046215/f_jpg,q_auto,w_176,h_176,c_fill,g_auto/Paul/banner-images/${id}`;
        });
      });

      try {
        await Promise.all(imagePromises);
        setImagesPreloaded(true);
      } catch (error) {
        console.warn('Some images failed to preload:', error);
        setImagesPreloaded(true); // Continue anyway
      }
    };

    preloadImages();
  }, []);

  // Load initial photos
  useEffect(() => {
    const loadInitialPhotos = async () => {
      const photosPerRow = visiblePhotoCount / 2;

      // Generate photos for row 1
      const row1PhotosArray: number[] = [];
      for (let i = 0; i < photosPerRow; i++) {
        const photoIndex = (startingIndex + i) % PHOTO_IDS.length;
        row1PhotosArray.push(photoIndex);
      }

      // Generate photos for row 2
      const row2PhotosArray: number[] = [];
      for (let i = 0; i < photosPerRow; i++) {
        const photoIndex =
          (startingIndex + photosPerRow + i) % PHOTO_IDS.length;
        row2PhotosArray.push(photoIndex);
      }

      // Always use sequential loading for visual effect
      setRow1Photos(row1PhotosArray);
      setRow2Photos(row2PhotosArray);

      // Sequential visual reveal
      setVisiblePhotoIndices([]);

      // Calculate delay to fit all photos in 1 second
      const totalPhotos = visiblePhotoCount;
      const delay = 1000 / totalPhotos;

      // Load first row
      for (let i = 0; i < photosPerRow; i++) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        setVisiblePhotoIndices((prev) => [...prev, i]);
      }

      // Load second row after first row completes
      for (let i = 0; i < photosPerRow; i++) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        setVisiblePhotoIndices((prev) => [...prev, photosPerRow + i]);
      }
    };

    loadInitialPhotos();
  }, [startingIndex, visiblePhotoCount, imagesPreloaded]);

  // Photo transition timer
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);

      // Move to next starting index
      const nextStartingIndex = (startingIndex + increment) % PHOTO_IDS.length;
      setStartingIndex(nextStartingIndex);

      // Load new photos with stagger
      const loadNewPhotos = async () => {
        const photosPerRow = visiblePhotoCount / 2;

        // Generate photos for row 1
        const row1PhotosArray: number[] = [];
        for (let i = 0; i < photosPerRow; i++) {
          const photoIndex = (nextStartingIndex + i) % PHOTO_IDS.length;
          row1PhotosArray.push(photoIndex);
        }

        // Generate photos for row 2
        const row2PhotosArray: number[] = [];
        for (let i = 0; i < photosPerRow; i++) {
          const photoIndex =
            (nextStartingIndex + photosPerRow + i) % PHOTO_IDS.length;
          row2PhotosArray.push(photoIndex);
        }

        // Always use sequential loading for visual effect
        setRow1Photos(row1PhotosArray);
        setRow2Photos(row2PhotosArray);

        // Sequential visual reveal
        setVisiblePhotoIndices([]);
        const transitionPhotosPerRow = visiblePhotoCount / 2;

        // Calculate delay to fit all photos in 1 second
        const totalPhotos = visiblePhotoCount;
        const delay = 1000 / totalPhotos;

        // Load first row
        for (let i = 0; i < transitionPhotosPerRow; i++) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          setVisiblePhotoIndices((prev) => [...prev, i]);
        }

        // Load second row after first row completes
        for (let i = 0; i < transitionPhotosPerRow; i++) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          setVisiblePhotoIndices((prev) => [
            ...prev,
            transitionPhotosPerRow + i,
          ]);
        }

        setIsTransitioning(false);
      };

      loadNewPhotos();
    }, 5000); // Swap every 5 seconds

    return () => clearInterval(interval);
  }, [startingIndex, visiblePhotoCount, increment]);

  // Progress bar effect
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0; // Reset when complete
        }
        return prev + 100 / 50; // Increment to reach 100% in 5 seconds (50 * 100ms)
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <section className="relative w-screen h-88 overflow-hidden -mr-4 mb-6 -mt-8">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 z-10">
        <div
          className="h-full bg-gray-600 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-col w-full h-full overflow-hidden">
        {/* First row */}
        <div className="flex flex-nowrap w-full h-1/2 overflow-hidden">
          {row1Photos.map((photoIndex: number, index: number) => {
            const actualPhotoId = PHOTO_IDS[photoIndex];
            const isVisible = visiblePhotoIndices.includes(index);

            return (
              <div
                key={`row1-${index}-${startingIndex}`}
                className={`w-[25vw] h-[25vw] sm:w-[16.666667vw] sm:h-[16.666667vw] md:w-[12.5vw] md:h-[12.5vw] lg:w-[10vw] lg:h-[10vw] xl:w-[8.333333vw] xl:h-[8.333333vw] 2xl:w-[6.25vw] 2xl:h-[6.25vw] overflow-hidden bg-gray-200 flex-shrink-0 transition-opacity duration-300 ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {photoIndex !== undefined && (
                  <Image
                    src={`https://res.cloudinary.com/aborstein/image/upload/v1756046215/f_jpg,q_auto,w_176,h_176,c_fill,g_auto/Paul/banner-images/${actualPhotoId}`}
                    alt={`Paul memory photo ${actualPhotoId}`}
                    width={176}
                    height={176}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Second row */}
        <div className="flex flex-nowrap w-full h-1/2 overflow-hidden">
          {row2Photos.map((photoIndex: number, index: number) => {
            const actualPhotoId = PHOTO_IDS[photoIndex];
            const isVisible = visiblePhotoIndices.includes(
              index + row1Photos.length
            );

            return (
              <div
                key={`row2-${index}-${startingIndex}`}
                className={`w-[25vw] h-[25vw] sm:w-[16.666667vw] sm:h-[16.666667vw] md:w-[12.5vw] md:h-[12.5vw] lg:w-[10vw] lg:h-[10vw] xl:w-[8.333333vw] xl:h-[8.333333vw] 2xl:w-[6.25vw] 2xl:h-[6.25vw] overflow-hidden bg-gray-200 flex-shrink-0 transition-opacity duration-300 ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {photoIndex !== undefined && (
                  <Image
                    src={`https://res.cloudinary.com/aborstein/image/upload/v1756046215/f_jpg,q_auto,w_176,h_176,c_fill,g_auto/Paul/banner-images/${actualPhotoId}`}
                    alt={`Paul memory photo ${actualPhotoId}`}
                    width={176}
                    height={176}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
