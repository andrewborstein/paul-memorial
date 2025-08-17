// Cloudinary utility functions
export function optimizeImageUrl(url: string, width: number = 1600) {
  if (!url.includes('cloudinary.com')) return url
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`)
}

export function getCloudinaryUploadUrl(cloudName: string) {
  return `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`
}
