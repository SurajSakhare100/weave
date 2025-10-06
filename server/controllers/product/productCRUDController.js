import asyncHandler from 'express-async-handler';
import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import { uploadMultipleImages, deleteMultipleImages } from '../../utils/imageUpload.js';
import mongoose from 'mongoose';

export const createProduct = asyncHandler(async (req, res) => {
  try {
    if (!req.vendor) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: Vendor authentication required.' 
      });
    }

    const {
      name,
      price,
      mrp,
      discount,
      category,
      description,
      srtDescription,
      seoDescription,
      seoKeyword,
      seoTitle,
      pickup_location,
      return: returnPolicy,
      cancellation,
      variant,
      variantDetails,
      stock,
      colors,
      colorVariants,
      status,
      keyFeatures,
      productDetails,
      tags,
      offers,
      salePrice,
      sizes
    } = req.body;


    // Helper function to parse FormData fields that might be JSON strings
    const parseFormDataField = (field) => {
      if (!field) return field;
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch {
          return field; // Return as string if not valid JSON
        }
      }
      return field;
    };

    // Parse FormData fields that are sent as JSON strings
    const parsedKeyFeatures = parseFormDataField(keyFeatures);
    const parsedTags = parseFormDataField(tags);
    const parsedSizes = parseFormDataField(sizes);

    console.log('Received colorVariants:', colorVariants);

    // Basic validation (detailed validation is handled by middleware)
    // Note: No main images required - only color-specific images

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Get category slug
    const categoryDoc = await Category.findOne({ name: category });
    let categorySlug = 'general'; // Default slug
    
    if (categoryDoc) {
      categorySlug = categoryDoc.slug;
    } else if (category === 'General') {
      categorySlug = 'general';
    } else {
      categorySlug = category.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Handle color-specific image uploads to Cloudinary
    let colorImages = {};
    let images = [];

    // Debug: Log received files
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        console.log(`File ${index}: fieldname=${file.fieldname}, originalname=${file.originalname}, size=${file.size}`);
      });
    }

    // Process files from flexible upload
    if (req.files && req.files.length > 0) {
      try {
        // Separate main images and color-specific images
        const mainImageFiles = [];
        const colorFileMap = {};

        req.files.forEach(file => {
          // Check if file is a color-specific image
          const colorMatch = file.fieldname.match(/colorImages\[([^\]]+)\]/);
          if (colorMatch) {
            const color = colorMatch[1];
            if (!colorFileMap[color]) {
              colorFileMap[color] = [];
            }
            colorFileMap[color].push(file);
          } else if (file.fieldname === 'images') {
            // Main product images
            mainImageFiles.push(file);
          }
        });

        // Upload main product images
        if (mainImageFiles.length > 0) {
          const mainImageBuffers = mainImageFiles.map(file => file.buffer);
          const mainUploadResults = await uploadMultipleImages(
            mainImageBuffers, 
            'weave-products', 
            `product_${slug}_${Date.now()}`
          );

          // Process main image upload results
          images = mainUploadResults.map((result, index) => ({
            url: result.url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            thumbnail_url: result.eager && result.eager[0] ? result.eager[0].url : result.url,
            small_thumbnail_url: result.eager && result.eager[1] ? result.eager[1].url : result.url,
            is_primary: index === 0 // First image is primary
          }));
        }

        // Upload color-specific images
        for (const [color, files] of Object.entries(colorFileMap)) {
          const imageBuffers = files.map(file => file.buffer);
          const uploadResults = await uploadMultipleImages(
            imageBuffers, 
            'weave-products', 
            `product_${slug}_${color}_${Date.now()}`
          );

          // Process upload results for this color
          colorImages[color] = uploadResults.map((result, index) => ({
            url: result.url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            thumbnail_url: result.eager && result.eager[0] ? result.eager[0].url : result.url,
            small_thumbnail_url: result.eager && result.eager[1] ? result.eager[1].url : result.url,
            is_primary: index === 0 // First image is primary
          }));
        }
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images. Please try again.'
        });
      }
    }

    // Note: Main images validation removed - using color variant images

    // Calculate discount if not provided
    let calculatedDiscount = discount;
    if (!calculatedDiscount && mrp && price && mrp > price) {
      calculatedDiscount = Math.round(((mrp - price) / mrp) * 100);
    }

    // Handle sizes field to prevent empty array issues
    let processedSizes = ['M']; // Default size
    if (parsedSizes !== undefined) {
      if (Array.isArray(parsedSizes) && parsedSizes.length > 0) {
        processedSizes = parsedSizes;
      }
    }

    // Process colorVariants if provided
    let colorVariantsData = [];
    if (colorVariants) {
      
      try {
        // Parse colorVariants if it's a JSON string
        let parsedColorVariants;
        if (typeof colorVariants === 'string') {
          parsedColorVariants = JSON.parse(colorVariants);
        } else if (Array.isArray(colorVariants)) {
          parsedColorVariants = colorVariants;
        } else {
          throw new Error('colorVariants must be a JSON string or array');
        }

        if (Array.isArray(parsedColorVariants) && parsedColorVariants.length > 0) {
          colorVariantsData = parsedColorVariants.map(variant => ({
            colorName: String(variant.colorName),
            colorCode: String(variant.colorCode),
            stock: Number(variant.stock) || 0,
            isActive: variant.isActive !== undefined ? Boolean(variant.isActive) : true,
            images: [] // Will be populated below
          }));
        }
        
      } catch (parseError) {
        console.error('Error parsing colorVariants:', parseError);
        console.error('Raw colorVariants value:', colorVariants);
        return res.status(400).json({
          success: false,
          message: 'Invalid colorVariants format.'
        });
      }
    }

    // Handle color variant image uploads
    if (req.files && colorVariantsData.length > 0) {
      try {
        // Group files by color for new colorVariants system
        const colorVariantFileMap = {};
        for (const [fieldName, files] of Object.entries(req.files)) {
          if (fieldName.startsWith('colorVariantImages[')) {
            // Extract color name from field name like "colorVariantImages[Red][0]"
            const colorMatch = fieldName.match(/colorVariantImages\[([^\]]+)\]/);
            if (colorMatch) {
              const colorName = colorMatch[1];
              if (!colorVariantFileMap[colorName]) {
                colorVariantFileMap[colorName] = [];
              }
              colorVariantFileMap[colorName].push(...files);
            }
          }
        }

        // Upload color-specific images for new system
        for (const [color, files] of Object.entries(colorVariantFileMap)) {
          const imageBuffers = files.map(file => file.buffer);
          const uploadResults = await uploadMultipleImages(
            imageBuffers, 
            'weave-products', 
            `product_${slug}_${color}_${Date.now()}`
          );

          // Process upload results for this color
          const colorImages = uploadResults.map((result, index) => ({
            url: result.url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            thumbnail_url: result.eager && result.eager[0] ? result.eager[0].url : result.url,
            small_thumbnail_url: result.eager && result.eager[1] ? result.eager[1].url : result.url,
            is_primary: index === 0 // First image is primary
          }));

          // Add images to the corresponding color variant
          const colorVariant = colorVariantsData.find(cv => cv.colorName === color);
          if (colorVariant) {
            colorVariant.images = colorImages;
          }
        }
      } catch (uploadError) {
        console.error('Color variant image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload color variant images. Please try again.'
        });
      }
    }
    // Debug: Log the data being passed to Product.create
    console.log('Creating product with colorVariantsData:', colorVariantsData);
    console.log('Type of colorVariantsData:', typeof colorVariantsData);
    console.log('Is colorVariantsData array:', Array.isArray(colorVariantsData));

    // Build the product data object
    const productData = {
      name: name.trim(),
      slug,
      price: Number(price),
      mrp: Number(mrp),
      discount: calculatedDiscount,
      vendorId: req.vendor._id,
      vendor: true,
      category: category.trim(),
      categorySlug,
      description: description?.trim(),
      srtDescription: srtDescription?.trim(),
      seoDescription: seoDescription?.trim(),
      seoKeyword: seoKeyword?.trim(),
      seoTitle: seoTitle?.trim(),
      pickup_location: pickup_location?.trim(),
      return: returnPolicy !== undefined ? returnPolicy : true,
      cancellation: cancellation !== undefined ? cancellation : true,
      variant: variant || false,
      variantDetails: variant ? (variantDetails || []) : [],
      stock: Number(stock) || 0,
      colors: Array.isArray(colors) ? colors : [],
      status: status || 'active',
      images,
      colorImages,
      keyFeatures: Array.isArray(parsedKeyFeatures) ? parsedKeyFeatures.filter(f => f.trim()) : [],
      productDetails: productDetails || {},
      tags: Array.isArray(parsedTags) ? parsedTags.filter(t => t.trim()) : [],
      offers: offers || false,
      salePrice: salePrice ? Number(salePrice) : undefined,
      sizes: processedSizes
    };

    // Only add colorVariants if it's properly formatted
    if (Array.isArray(colorVariantsData) && colorVariantsData.length > 0) {
      productData.colorVariants = colorVariantsData;
      
      // Calculate total stock from all color variants
      const totalStock = colorVariantsData.reduce((sum, variant) => sum + (variant.stock || 0), 0);
      productData.stock = totalStock;
      
      // Set main product image from first color variant's first image
      const firstVariant = colorVariantsData[0];
      if (firstVariant && firstVariant.images && firstVariant.images.length > 0) {
        productData.images = [firstVariant.images[0]]; // Use first color variant's first image as main image
      }
    }

    console.log('Final product data:', JSON.stringify(productData, null, 2));

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product'
    });
  }
});

export const updateProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if vendor owns this product
    if (product.vendorId.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // Strong server-side validation for update
    const errors = [];
    const { colors, mrp, price, name } = req.body;
    
    if (name && (typeof name !== 'string' || !name.trim())) {
      errors.push('Product name must be a valid string.');
    }
    if (name && name.length > 100) {
      errors.push('Product name cannot exceed 100 characters.');
    }
    if (mrp !== undefined && (isNaN(Number(mrp)) || Number(mrp) < 0)) {
      errors.push('Valid MRP is required.');
    }
    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
      errors.push('Valid price is required.');
    }

    // Handle existing images
    let images = product.images || [];
    if (req.body.existingImages) {
      try {
        const existingImages = JSON.parse(req.body.existingImages);
        images = existingImages;
      } catch (error) {
        console.error('Error parsing existingImages:', error);
        images = [];
      }
    }

    // Check for at least one image (existing or new)
    if ((!images || images.length === 0) && (!req.files || req.files.length === 0)) {
      errors.push('At least one image is required.');
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: errors.join(' ') 
      });
    }

    // Helper function to parse FormData fields (same as create)
    const parseFormDataField = (field) => {
      if (!field) return field;
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch {
          return field;
        }
      }
      return field;
    };

    // Parse FormData fields that are sent as JSON strings
    const parsedColors = parseFormDataField(colors);
    const parsedSizes = parseFormDataField(req.body.sizes);

    // Process colors array
    if (parsedColors) {
      req.body.colors = Array.isArray(parsedColors) ? parsedColors : [parsedColors];
    }

    // Handle sizes field to prevent empty array issues
    if (parsedSizes !== undefined) {
      if (Array.isArray(parsedSizes) && parsedSizes.length === 0) {
        req.body.sizes = ['M']; // Set default size if empty array
      } else {
        req.body.sizes = parsedSizes;
      }
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      try {
        const imageBuffers = req.files.map(file => file.buffer);
        const uploadResults = await uploadMultipleImages(
          imageBuffers, 
          'weave-products', 
          `product_${product.slug}_${Date.now()}`
        );

        // Process upload results
        const newImages = uploadResults.map((result, index) => ({
          url: result.url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          thumbnail_url: result.eager && result.eager[0] ? result.eager[0].url : result.url,
          small_thumbnail_url: result.eager && result.eager[1] ? result.eager[1].url : result.url,
          is_primary: images.length === 0 && index === 0 // Primary if no existing images
        }));

        images = [...images, ...newImages];
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload new images. Please try again.'
        });
      }
    }

    // Handle color-specific image uploads
    let colorImages = product.colorImages || {};
    if (req.files) {
      try {
        // Group files by color
        const colorFileMap = {};
        Object.keys(req.files).forEach(key => {
          if (key.startsWith('colorImages[')) {
            const colorMatch = key.match(/colorImages\[([^\]]+)\]/);
            if (colorMatch) {
              const color = colorMatch[1];
              if (!colorFileMap[color]) {
                colorFileMap[color] = [];
              }
              colorFileMap[color].push(req.files[key]);
            }
          }
        });

        // Upload color-specific images
        for (const [color, files] of Object.entries(colorFileMap)) {
          const imageBuffers = files.map(file => file.buffer);
          const uploadResults = await uploadMultipleImages(
            imageBuffers, 
            'weave-products', 
            `product_${product.slug}_${color}_${Date.now()}`
          );

          // Process upload results for this color
          const newColorImages = uploadResults.map((result, index) => ({
            url: result.url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            thumbnail_url: result.eager && result.eager[0] ? result.eager[0].url : result.url,
            small_thumbnail_url: result.eager && result.eager[1] ? result.eager[1].url : result.url,
            is_primary: index === 0 // First image is primary
          }));

          // Merge with existing color images
          colorImages[color] = [
            ...(colorImages[color] || []),
            ...newColorImages
          ];
        }
      } catch (uploadError) {
        console.error('Color-specific image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload color-specific images. Please try again.'
        });
      }
    }

    // Handle existing color images
    if (req.body.existingColorImages) {
      try {
        const existingColorImages = JSON.parse(req.body.existingColorImages);
        colorImages = {
          ...colorImages,
          ...existingColorImages
        };
      } catch (error) {
        console.error('Error parsing existingColorImages:', error);
      }
    }

    // Process colorVariants if provided (same logic as create)
    let colorVariantsData = [];
    if (req.body.colorVariants) {
      console.log('Update - Received colorVariants:', req.body.colorVariants);
      console.log('Update - Type of colorVariants:', typeof req.body.colorVariants);
      
      try {
        let parsedColorVariants;
        if (typeof req.body.colorVariants === 'string') {
          parsedColorVariants = JSON.parse(req.body.colorVariants);
        } else if (Array.isArray(req.body.colorVariants)) {
          parsedColorVariants = req.body.colorVariants;
        } else {
          throw new Error('colorVariants must be a JSON string or array');
        }

        if (Array.isArray(parsedColorVariants) && parsedColorVariants.length > 0) {
          colorVariantsData = parsedColorVariants.map(variant => ({
            colorName: String(variant.colorName),
            colorCode: String(variant.colorCode),
            stock: Number(variant.stock) || 0,
            isActive: variant.isActive !== undefined ? Boolean(variant.isActive) : true,
            images: [] // Will be populated below if images are uploaded
          }));
        }
        
        console.log('Update - Final colorVariantsData:', colorVariantsData);
      } catch (parseError) {
        console.error('Update - Error parsing colorVariants:', parseError);
        return res.status(400).json({
          success: false,
          message: 'Invalid colorVariants format.'
        });
      }
    }

    // Handle color variant image uploads for updates
    if (req.files && colorVariantsData.length > 0) {
      try {
        const colorVariantFileMap = {};
        for (const [fieldName, files] of Object.entries(req.files)) {
          if (fieldName.startsWith('colorVariantImages[')) {
            const colorMatch = fieldName.match(/colorVariantImages\[([^\]]+)\]/);
            if (colorMatch) {
              const colorName = colorMatch[1];
              if (!colorVariantFileMap[colorName]) {
                colorVariantFileMap[colorName] = [];
              }
              colorVariantFileMap[colorName].push(...files);
            }
          }
        }

        // Upload color-specific images for new system
        for (const [color, files] of Object.entries(colorVariantFileMap)) {
          const imageBuffers = files.map(file => file.buffer);
          const uploadResults = await uploadMultipleImages(
            imageBuffers, 
            'weave-products', 
            `product_${product.slug}_${color}_${Date.now()}`
          );

          // Process upload results for this color
          const colorImages = uploadResults.map((result, index) => ({
            url: result.url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            thumbnail_url: result.eager && result.eager[0] ? result.eager[0].url : result.url,
            small_thumbnail_url: result.eager && result.eager[1] ? result.eager[1].url : result.url,
            is_primary: index === 0
          }));

          // Add images to the corresponding color variant
          const colorVariant = colorVariantsData.find(cv => cv.colorName === color);
          if (colorVariant) {
            colorVariant.images = colorImages;
          }
        }
      } catch (uploadError) {
        console.error('Update - Color variant image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload color variant images. Please try again.'
        });
      }
    }

    // Create update data object, excluding colorVariants from req.body to avoid string casting
    let updateData = { 
      ...req.body, 
      images, 
      colorImages 
    };

    // Remove colorVariants from updateData if it exists (we'll add it properly below)
    if (updateData.colorVariants) {
      delete updateData.colorVariants;
    }

    // Only add colorVariants if it's properly formatted
    if (Array.isArray(colorVariantsData) && colorVariantsData.length > 0) {
      updateData.colorVariants = colorVariantsData;
      
      // Calculate total stock from all color variants
      const totalStock = colorVariantsData.reduce((sum, variant) => sum + (variant.stock || 0), 0);
      updateData.stock = totalStock;
      
      // Update main product image from first color variant's first image if no main images exist
      if ((!images || images.length === 0)) {
        const firstVariant = colorVariantsData[0];
        if (firstVariant && firstVariant.images && firstVariant.images.length > 0) {
          images = [firstVariant.images[0]]; // Use first color variant's first image as main image
          updateData.images = images;
        }
      }
    }

    // Calculate discount if price or MRP changed
    if ((req.body.price !== undefined || req.body.mrp !== undefined) && !req.body.discount) {
      const newPrice = req.body.price !== undefined ? Number(req.body.price) : product.price;
      const newMrp = req.body.mrp !== undefined ? Number(req.body.mrp) : product.mrp;
      if (newMrp > newPrice) {
        updateData.discount = Math.round(((newMrp - newPrice) / newMrp) * 100);
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update product'
    });
  }
});

export const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if vendor owns this product
    if (product.vendorId.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      try {
        const publicIds = product.images.map(img => img.public_id).filter(Boolean);
        if (publicIds.length > 0) {
          await deleteMultipleImages(publicIds);
        }
      } catch (deleteError) {
        console.error('Error deleting images from Cloudinary:', deleteError);
        // Continue with product deletion even if image deletion fails
      }
    }

    await Product.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete product'
    });
  }
});
