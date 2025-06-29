import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

/**
 * Upload single image to Cloudinary
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} folder - Cloudinary folder name
 * @param {string} publicId - Optional public ID for the image
 * @returns {Promise<Object>} Upload result with URL and public_id
 */
export const uploadImage = async (imageBuffer, folder = 'weave-products', publicId = null) => {
  try {
    // Convert buffer to stream
    const stream = Readable.from(imageBuffer);
    
    // Upload options
    const uploadOptions = {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit' }, // Resize for consistency
        { quality: 'auto', fetch_format: 'auto' }   // Optimize quality and format
      ],
      eager: [
        { width: 400, height: 400, crop: 'fill' },  // Thumbnail
        { width: 200, height: 200, crop: 'fill' }   // Small thumbnail
      ],
      eager_async: true,
      eager_notification_url: process.env.CLOUDINARY_NOTIFICATION_URL || null
    };

    // Add public_id if provided
    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new Error('Failed to upload image to Cloudinary'));
          } else {
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
              eager: result.eager || []
            });
          }
        }
      );

      stream.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('Failed to process image upload');
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array<Buffer>} imageBuffers - Array of image buffers
 * @param {string} folder - Cloudinary folder name
 * @param {string} basePublicId - Base public ID for the images
 * @returns {Promise<Array<Object>>} Array of upload results
 */
export const uploadMultipleImages = async (imageBuffers, folder = 'weave-products', basePublicId = null) => {
  try {
    const uploadPromises = imageBuffers.map((buffer, index) => {
      const publicId = basePublicId ? `${basePublicId}_${index + 1}` : null;
      return uploadImage(buffer, folder, publicId);
    });

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple image upload error:', error);
    throw new Error('Failed to upload multiple images');
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Image deletion error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array<string>} publicIds - Array of Cloudinary public IDs
 * @returns {Promise<Array<Object>>} Array of deletion results
 */
export const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(publicId => deleteImage(publicId));
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    console.error('Multiple image deletion error:', error);
    throw new Error('Failed to delete multiple images');
  }
};

/**
 * Update image in Cloudinary (delete old, upload new)
 * @param {Buffer} newImageBuffer - New image buffer
 * @param {string} oldPublicId - Old image public ID
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Object>} Upload result
 */
export const updateImage = async (newImageBuffer, oldPublicId, folder = 'weave-products') => {
  try {
    // Delete old image if it exists
    if (oldPublicId) {
      await deleteImage(oldPublicId);
    }

    // Upload new image
    const result = await uploadImage(newImageBuffer, folder);
    return result;
  } catch (error) {
    console.error('Image update error:', error);
    throw new Error('Failed to update image');
  }
};

/**
 * Generate Cloudinary URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} Transformed URL
 */
export const generateImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    width: 800,
    height: 800,
    crop: 'limit',
    quality: 'auto',
    fetch_format: 'auto'
  };

  const transformationOptions = { ...defaultOptions, ...options };
  return cloudinary.url(publicId, { transformation: [transformationOptions] });
};

/**
 * Validate image file
 * @param {Object} file - File object from multer
 * @returns {boolean} Whether file is valid
 */
export const validateImageFile = (file) => {
  // Check if file exists
  if (!file) {
    return false;
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return false;
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return false;
  }

  return true;
};

/**
 * Process and optimize image buffer
 * @param {Buffer} buffer - Image buffer
 * @returns {Buffer} Optimized buffer
 */
export const processImageBuffer = (buffer) => {
  // For now, return the original buffer
  // In a production environment, you might want to add image processing here
  // using libraries like sharp or jimp
  return buffer;
}; 