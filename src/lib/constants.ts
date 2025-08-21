// Cloudinary image constants
export const CLOUDINARY_IMAGES = {
  // Hero images
  HERO_IMAGE_TEXT: 'Paul/hero-image-text',
  HERO_IMAGE_PHOTO: 'Paul/hero-image-photo',

  // Flyer images
  FLYER_FRONT: 'Paul/flyer-front',
  FLYER_BACK: 'Paul/flyer-back',
} as const;

// Type for the image keys
export type CloudinaryImageKey = keyof typeof CLOUDINARY_IMAGES;

// Helper function to get image URL with version
export function getImageUrl(
  key: CloudinaryImageKey,
  version?: string | number
) {
  return CLOUDINARY_IMAGES[key];
}
