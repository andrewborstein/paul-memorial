// Cloudinary utility functions
export function optimizeImageUrl(url: string, width: number = 400, quality: number = 70) {
  if (!url.includes('cloudinary.com')) return url
  return url.replace('/upload/', `/upload/f_auto,q_${quality},w_${width}/`)
}

export function getCloudinaryUploadUrl(cloudName: string) {
  return `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`
}

export function publicIdToUrl(publicId: string, type: 'image' | 'video' = 'image', width: number = 400, quality: number = 70) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
  const resourceType = type === 'video' ? 'video' : 'image'
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/f_auto,q_${quality},w_${width}/${publicId}`
}

// Helper functions for different use cases
export function getThumbnailUrl(publicId: string, type: 'image' | 'video' = 'image') {
  return publicIdToUrl(publicId, type, 200, 60)
}

export function getSmallThumbnailUrl(publicId: string, type: 'image' | 'video' = 'image') {
  return publicIdToUrl(publicId, type, 96, 50)
}

export function getFullSizeUrl(publicId: string, type: 'image' | 'video' = 'image') {
  return publicIdToUrl(publicId, type, 1600, 80)
}
