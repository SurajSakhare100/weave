/**
 * Utility functions for handling Cloudinary images in the frontend
 */

export interface CloudinaryImage {
  url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  thumbnail_url: string;
  small_thumbnail_url: string;
  is_primary: boolean;
}

/**
 * Get the primary image URL from a product's images array
 * @param images - Array of Cloudinary images
 * @param fallback - Fallback image URL if no images exist
 * @returns The primary image URL or fallback
 */
export const getPrimaryImageUrl = (images: CloudinaryImage[], fallback: string = '/products/product.png'): string => {
  if (!images || images.length === 0) {
    return fallback;
  }
  
  const primaryImage = images.find(img => img.is_primary);
  return primaryImage ? primaryImage.url : images[0].url;
};

/**
 * Get the thumbnail URL from a product's images array
 * @param images - Array of Cloudinary images
 * @param fallback - Fallback image URL if no images exist
 * @returns The thumbnail URL or fallback
 */
export const getThumbnailUrl = (images: CloudinaryImage[], fallback: string = '/products/product.png'): string => {
  if (!images || images.length === 0) {
    return fallback;
  }
  
  const primaryImage = images.find(img => img.is_primary);
  const image = primaryImage || images[0];
  return image.thumbnail_url || image.url;
};

/**
 * Get the small thumbnail URL from a product's images array
 * @param images - Array of Cloudinary images
 * @param fallback - Fallback image URL if no images exist
 * @returns The small thumbnail URL or fallback
 */
export const getSmallThumbnailUrl = (images: CloudinaryImage[], fallback: string = '/products/product.png'): string => {
  if (!images || images.length === 0) {
    return fallback;
  }
  
  const primaryImage = images.find(img => img.is_primary);
  const image = primaryImage || images[0];
  return image.small_thumbnail_url || image.thumbnail_url || image.url;
};

/**
 * Get all image URLs from a product's images array
 * @param images - Array of Cloudinary images
 * @returns Array of image URLs
 */
export const getAllImageUrls = (images: CloudinaryImage[]): string[] => {
  if (!images || images.length === 0) {
    return [];
  }
  
  return images.map(img => img.url);
};

/**
 * Convert legacy files array to Cloudinary images format
 * @param files - Legacy files array
 * @returns Array of Cloudinary image objects
 */
export const convertLegacyFilesToImages = (files: string[]): CloudinaryImage[] => {
  if (!files || files.length === 0) {
    return [];
  }
  
  return files.map((file, index) => ({
    url: file.startsWith('http') ? file : `http://localhost:5000/uploads/${file}`,
    public_id: `legacy_${index}`,
    width: 800,
    height: 800,
    format: 'jpeg',
    bytes: 0,
    thumbnail_url: file.startsWith('http') ? file : `http://localhost:5000/uploads/${file}`,
    small_thumbnail_url: file.startsWith('http') ? file : `http://localhost:5000/uploads/${file}`,
    is_primary: index === 0
  }));
};

/**
 * Get image URLs for gallery display
 * @param images - Array of Cloudinary images
 * @param legacyFiles - Legacy files array (for backward compatibility)
 * @returns Array of image objects for gallery
 */
export const getGalleryImages = (images: CloudinaryImage[], legacyFiles?: string[]) => {
  if (images && images.length > 0) {
    return images.map((img, index) => ({
      src: img.url,
      alt: `Product image ${index + 1}`,
      thumbnail: img.thumbnail_url || img.url,
      smallThumbnail: img.small_thumbnail_url || img.thumbnail_url || img.url
    }));
  }
  
  if (legacyFiles && legacyFiles.length > 0) {
    return legacyFiles.map((file, index) => ({
      src: file.startsWith('http') ? file : `http://localhost:5000/uploads/${file}`,
      alt: `Product image ${index + 1}`,
      thumbnail: file.startsWith('http') ? file : `http://localhost:5000/uploads/${file}`,
      smallThumbnail: file.startsWith('http') ? file : `http://localhost:5000/uploads/${file}`
    }));
  }
  
  return [{
    src: '/products/product.png',
    alt: 'Product placeholder',
    thumbnail: '/products/product.png',
    smallThumbnail: '/products/product.png'
  }];
};

/**
 * Validate image file before upload
 * @param file - File object
 * @returns Validation result
 */
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPEG, PNG, and WebP files are allowed'
    };
  }
  
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 10MB'
    };
  }
  
  return { isValid: true };
};

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate image preview URL
 * @param file - File object
 * @returns Preview URL
 */
export const generateImagePreview = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Clean up image preview URL
 * @param previewUrl - Preview URL to clean up
 */
export const cleanupImagePreview = (previewUrl: string): void => {
  URL.revokeObjectURL(previewUrl);
};

/**
 * Get optimized image URL with Cloudinary transformations
 * @param imageUrl - Original image URL
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (
  imageUrl: string, 
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }
  
  const { width, height, quality = 'auto', format = 'auto' } = options;
  
  // If it's already a Cloudinary URL, we can add transformations
  if (imageUrl.includes('cloudinary.com')) {
    const baseUrl = imageUrl.split('/upload/')[0] + '/upload/';
    const imagePath = imageUrl.split('/upload/')[1];
    
    let transformations = '';
    if (width) transformations += `w_${width},`;
    if (height) transformations += `h_${height},`;
    if (quality !== 'auto') transformations += `q_${quality},`;
    if (format !== 'auto') transformations += `f_${format},`;
    
    if (transformations) {
      transformations = transformations.slice(0, -1); // Remove trailing comma
      return `${baseUrl}${transformations}/${imagePath}`;
    }
  }
  
  return imageUrl;
}; 