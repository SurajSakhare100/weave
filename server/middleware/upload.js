import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { validateImageFile } from '../utils/imageUpload.js';

// Ensure uploads directory exists
export const ensureUploadsDir = (req, res, next) => {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  next();
};

// Multer configuration for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Validate image file
  if (!validateImageFile(file)) {
    cb(new Error('Invalid file type or size. Only JPEG, PNG, and WebP files up to 10MB are allowed.'), false);
    return;
  }
  cb(null, true);
};

// Multer instance for multiple files
export const uploadMultiple = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10 // Maximum 10 files
  }
}).array('images', 10);

// Multer instance for single file
export const uploadSingle = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
}).single('image');

// Multer configuration for flexible file uploads
export const uploadFlexible = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // For flexible uploads, we'll validate in the middleware handler instead
    // This allows us to handle dynamic field names properly
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 20 // Maximum 20 files total
  }
}).any(); // Allows any number of files with any field names

// Error handling middleware
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  console.error('Upload error:', error);
  return res.status(500).json({
    success: false,
    message: 'File upload failed. Please try again.'
  });
};

// Middleware to process uploaded files for Cloudinary
export const processUploadedFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      // return res.status(400).json({
      //   success: false,
      //   message: 'No images uploaded. Please select at least one image.'
      // });
    }

    // Validate all files
    for (const file of req.files) {
      if (!validateImageFile(file)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file: ${file.originalname}. Only JPEG, PNG, and WebP files up to 10MB are allowed.`
        });
      }
    }

    // Add processed files to request
    req.processedFiles = req.files;
    next();
  } catch (error) {
    console.error('File processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing uploaded files.'
    });
  }
};

// Middleware to handle single file upload
export const handleSingleUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded. Please select an image.'
      });
    }

    if (!validateImageFile(req.file)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type or size. Only JPEG, PNG, and WebP files up to 10MB are allowed.'
      });
    }

    next();
  });
};

// Middleware to handle multiple file uploads
export const handleMultipleUpload = (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    // Validate all files
    for (const file of req.files) {
      if (!validateImageFile(file)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file: ${file.originalname}. Only JPEG, PNG, and WebP files up to 10MB are allowed.`
        });
      }
    }

    next();
  });
}; 

// Middleware to handle flexible file uploads
export const handleFlexibleUpload = (req, res, next) => {
  console.log('Upload middleware called');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Body keys:', Object.keys(req.body || {}));

  uploadFlexible(req, res, (err) => {
    if (err) {
      console.log('Upload error:', err);
      return handleUploadError(err, req, res, next);
    }

    console.log('Upload successful, files received:', req.files?.length || 0);

    // Validate all files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        console.log(`Validating file: ${file.fieldname} - ${file.originalname}`);
        if (!validateImageFile(file)) {
          console.log(`Invalid file: ${file.originalname}`);
          return res.status(400).json({
            success: false,
            message: `Invalid file: ${file.originalname}. Only JPEG, PNG, and WebP files up to 10MB are allowed.`
          });
        }
      }
    }

    next();
  });
}; 