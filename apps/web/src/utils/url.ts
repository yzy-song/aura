/**
 * 根据文件名构建完整的、可访问的图片 URL。
 * 它会读取 .env 文件中的 VITE_API_BASE_IMAGE_URL 变量。
 * @param filename - 图片的文件名，例如 'image.jpg'
 * @returns 完整的图片 URL
 */
export function getBackendAssetURL(filename: string | null | undefined): string {
  const base = import.meta.env.VITE_API_BASE_IMAGE_URL
  if (!filename || !base) return 'https://via.placeholder.com/400x400.png?text=No+Image'
  return `${base}/${filename}`
}

/**
 * 根据文件名构建完整的、可访问的头像 URL。
 * 它会读取 .env 文件中的 VITE_API_BASE_AVATAR_URL 变量。
 * @param filename - 头像的文件名，例如 'avatar.jpg'
 * @returns 完整的头像 URL
 */
export function getAvatarURL(filename: string | null | undefined): string {
  const base = import.meta.env.VITE_API_BASE_AVATAR_URL
  if (!filename || !base) return 'https://via.placeholder.com/100x100.png?text=No+Avatar'
  return `${base}/${filename}`
}

/**
 * 根据文件名构建完整的、可访问的横幅 URL。
 * 它会读取 .env 文件中的 VITE_API_BASE_BANNER_URL 变量。
 * @param filename - 横幅的文件名，例如 'banner.jpg'
 * @returns 完整的横幅 URL
 */
export function getBannerURL(filename: string | null | undefined): string {
  const base = import.meta.env.VITE_API_BASE_BANNER_URL
  if (!filename || !base) return 'https://via.placeholder.com/800x200.png?text=No+Banner'
  return `${base}/${filename}`
}
/**
 * 根据文件名构建完整的、可访问的照片墙图片 URL。
 * 它会读取 .env 文件中的 VITE_API_BASE_PHOTOWALL_URL 变量。
 * @param filename - 照片墙图片的文件名，例如 'photowall.jpg'
 * @returns 完整的照片墙图片 URL
 */
export function getPhotowallURL(filename: string | null | undefined): string {
  const base = import.meta.env.VITE_API_BASE_PHOTOWALL_URL
  if (!filename || !base) return 'https://via.placeholder.com/400x400.png?text=No+Photowall+Image'
  return `${base}/${filename}`
}
