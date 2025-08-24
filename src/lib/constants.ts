// Cloudinary image constants
export const CLOUDINARY_IMAGES = {
  // Hero images
  HERO_IMAGE_TEXT: 'Paul/hero-image-text',
  HERO_IMAGE_PHOTO: 'Paul/hero-image-photo',
  HERO_IMAGE_PAUL: 'Paul/hero-image-paul',
  HERO_IMAGE_RASTA_FLAG: 'Paul/hero-image-rasta-flag',
  HERO_IMAGE_TWO_FLAGS: 'Paul/hero-image-two-flags',
  HERO_IMAGE_DJ: 'Paul/hero-image-dj',
  HERO_IMAGE_OLI_AND_PAUL: 'Paul/hero-image-oli-and-paul',
  HERO_IMAGE_PAUL_AND_OLI: 'Paul/hero-image-paul-and-oli',

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
