# Cloudinary Setup Guide

This guide explains how to set up Cloudinary for image uploads in the Weave e-commerce platform.

## Prerequisites

1. A Cloudinary account (sign up at https://cloudinary.com/)
2. Node.js and npm installed
3. The project dependencies installed

## Setup Steps

### 1. Get Cloudinary Credentials

1. Log in to your Cloudinary dashboard
2. Go to the "Dashboard" section
3. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

### 2. Environment Configuration

Add the following environment variables to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_NOTIFICATION_URL=https://your-domain.com/api/webhooks/cloudinary
```

### 3. Cloudinary Account Setup

1. **Create a folder structure** (optional but recommended):
   - Go to your Cloudinary Media Library
   - Create folders like:
     - `weave-products` (for product images)
     - `weave-vendors` (for vendor profile images)
     - `weave-users` (for user profile images)

2. **Configure upload presets** (optional):
   - Go to Settings > Upload
   - Create upload presets for different image types
   - Set default transformations

### 4. Testing the Setup

1. Start your server:
   ```bash
   npm run dev
   ```

2. Test image upload using the vendor product creation endpoint:
   ```bash
   POST /api/products
   Content-Type: multipart/form-data
   
   Form data:
   - name: "Test Product"
   - price: 100
   - mrp: 120
   - category: "General"
   - images: [file1, file2, ...]
   ```

## Features

### Image Upload Features

- **Multiple image upload**: Upload up to 10 images per product
- **Automatic optimization**: Images are automatically optimized for web
- **Multiple sizes**: Thumbnails are generated automatically
- **Format conversion**: Images are converted to optimal formats
- **Secure URLs**: All images use HTTPS URLs

### Image Processing

- **Resizing**: Images are resized to max 800x800 pixels
- **Thumbnails**: 400x400 and 200x200 thumbnails are generated
- **Quality optimization**: Automatic quality optimization
- **Format optimization**: Automatic format selection (WebP when supported)

### File Validation

- **File types**: Only JPEG, PNG, and WebP files allowed
- **File size**: Maximum 10MB per file
- **File count**: Maximum 10 files per upload

## API Endpoints

### Product Image Upload

```javascript
// Create product with images
POST /api/products
Content-Type: multipart/form-data

// Update product with images
PUT /api/products/:id
Content-Type: multipart/form-data
```

### Image Management

The system automatically handles:
- Image upload to Cloudinary
- Image metadata storage in database
- Image deletion when products are deleted
- Image updates when products are updated

## Database Schema

The Product model includes an `images` array with the following structure:

```javascript
images: [{
  url: String,           // Full-size image URL
  public_id: String,     // Cloudinary public ID
  width: Number,         // Image width
  height: Number,        // Image height
  format: String,        // Image format
  bytes: Number,         // File size in bytes
  thumbnail_url: String, // 400x400 thumbnail URL
  small_thumbnail_url: String, // 200x200 thumbnail URL
  is_primary: Boolean    // Whether this is the primary image
}]
```

## Error Handling

The system includes comprehensive error handling for:
- Invalid file types
- File size limits
- Upload failures
- Cloudinary API errors
- Network issues

## Security Considerations

1. **File validation**: All files are validated before upload
2. **Size limits**: Strict file size limits prevent abuse
3. **Type restrictions**: Only image files are allowed
4. **Secure URLs**: All Cloudinary URLs use HTTPS
5. **Access control**: Only authenticated vendors can upload images

## Troubleshooting

### Common Issues

1. **Upload fails**: Check your Cloudinary credentials
2. **Images not displaying**: Verify the URLs are accessible
3. **Large file errors**: Ensure files are under 10MB
4. **Invalid file type**: Only use JPEG, PNG, or WebP files

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will log detailed information about upload processes.

## Performance Optimization

1. **Lazy loading**: Use thumbnail URLs for initial display
2. **CDN**: Cloudinary provides global CDN for fast loading
3. **Caching**: Cloudinary automatically caches transformed images
4. **Progressive loading**: Use different image sizes for different contexts

## Cost Considerations

- Cloudinary offers a free tier with generous limits
- Monitor your usage in the Cloudinary dashboard
- Consider upgrading for high-volume applications
- Implement image cleanup for deleted products

## Support

For issues related to:
- **Cloudinary**: Contact Cloudinary support
- **Application**: Check the application logs
- **Configuration**: Verify environment variables 