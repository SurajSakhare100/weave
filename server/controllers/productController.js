import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import { uploadMultipleImages, deleteMultipleImages } from '../utils/imageUpload.js';
import mongoose from 'mongoose';


export const getProducts = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort = '-createdAt',
      vendor,
      vendorOnly,
      status,
      size,
      colors
    } = req.query;

    // Build filter object
    const filter = {};

    // Status filter - default to active products
    if (status) {
      filter.status = status;
    } else {
      filter.status = 'active';
    }

    // Admin approval filter - Only show approved products on public website
    // For vendor products, they must be approved by admin
    filter.$and = [
      {
        $or: [
          { vendor: { $ne: true } }, // Non-vendor products (admin created)
          { 
            vendor: true,
            adminApproved: true // Vendor products must be approved
          }
        ]
      }
    ];

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Category filter
    if (category) {
      filter.categorySlug = { $regex: category, $options: 'i' };
    }

    // Vendor filter
    if (vendor) {
      filter.vendorId = vendor;
    }

    // Vendor-only filter
    if (vendorOnly === 'true') {
      if (!req.vendor) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized: Vendor authentication required.' 
        });
      }
      filter.vendor = true;
      filter.vendorId = req.vendor._id;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Size and color filters
    let orConditions = [];
    
    // Size filter (multi-select support, top-level and variant)
    if (size) {
      const sizeArray = size.split(',').map(s => s.trim()).filter(Boolean);
      if (sizeArray.length > 1) {
        orConditions.push({ 'variantDetails.size': { $in: sizeArray } });
        orConditions.push({ size: { $in: sizeArray } });
        orConditions.push({ sizes: { $in: sizeArray } });
      } else {
        orConditions.push({ 'variantDetails.size': sizeArray[0] });
        orConditions.push({ size: sizeArray[0] });
        orConditions.push({ sizes: sizeArray[0] });
      }
    }
    
    // Color filter - support both legacy colors and new color variants
    if (colors) {
      const colorArray = colors.split(',').map(c => c.trim()).filter(Boolean);
      if (colorArray.length > 1) {
        orConditions.push({ colors: { $in: colorArray } });
        orConditions.push({ 'variantDetails.color': { $in: colorArray } });
        orConditions.push({ 'colorVariants.colorName': { $in: colorArray } });
      } else {
        orConditions.push({ colors: colorArray[0] });
        orConditions.push({ 'variantDetails.color': colorArray[0] });
        orConditions.push({ 'colorVariants.colorName': colorArray[0] });
      }
    }
    
    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }

    // Availability filter
    if (req.query.availability === 'true') {
      filter.available = true;
      filter.$or = [
        { stock: { $gt: 0 } },
        { variantDetails: { $elemMatch: { stock: { $gt: 0 } } } }
      ];
    } else if (req.query.availability === 'false') {
      filter.available = false;
      filter.$or = [
        { stock: { $lte: 0 } },
        { variantDetails: { $elemMatch: { stock: { $lte: 0 } } } }
      ];
    }

    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'price':
        sortOption = { price: 1 };
        break;
      case '-price':
        sortOption = { price: -1 };
        break;
      case 'createdAt':
        sortOption = { createdAt: 1 };
        break;
      case '-createdAt':
        sortOption = { createdAt: -1 };
        break;
      case 'discount':
        sortOption = { discount: -1 };
        break;
      case 'rating':
        sortOption = { averageRating: -1 };
        break;
      case '-rating':
        sortOption = { averageRating: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Execute query with proper population
    const products = await Product.find(filter)
      .populate('vendorId', 'name email phone')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export const getProductById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    const product = await Product.findById(id)
      .populate('vendorId', 'name email phone')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product is approved for public access
    // Vendor products must be approved by admin to be visible
    if ( !product.adminApproved) {
      return res.status(404).json({
        success: false,
        message: 'Product not available',
        reason: 'pending_approval'
      });
    }

    // Get reviews for this product
    const reviews = await Review.find({ 
      proId: id, 
      isActive: true 
    })
      .populate('userId', 'firstName lastName email')
      .populate('responses.userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate average rating and total reviews
    let averageRating = 0;
    let totalReviews = 0;
    let ratingDistribution = [];

    if (reviews && reviews.length > 0) {
      totalReviews = reviews.length;
      
      const ratingSum = reviews.reduce((sum, review) => {
        const starValue = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 }[review.stars] || 0;
        return sum + starValue;
      }, 0);
      
      averageRating = Math.round((ratingSum / totalReviews) * 10) / 10;
      
      // Calculate rating distribution
      const distribution = { 'one': 0, 'two': 0, 'three': 0, 'four': 0, 'five': 0 };
      reviews.forEach(review => {
        distribution[review.stars]++;
      });
      
      ratingDistribution = Object.entries(distribution).map(([stars, count]) => ({
        _id: stars,
        count
      }));
    }

    // Add availableSizes virtual
    const availableSizes = product.sizes && product.sizes.length > 0 
      ? product.sizes 
      : ['M']; // Default size if no sizes are set

    const productWithReviews = {
      ...product,
      reviews,
      averageRating,
      totalReviews,
      ratingDistribution,
      availableSizes
    };

    res.json({
      success: true,
      data: productWithReviews
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;
    
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Product slug is required'
      });
    }

    const product = await Product.findOne({ slug: slug.toLowerCase() })
      .populate('vendorId', 'name email phone')
      .populate({
        path: 'reviews',
        populate: {
          path: 'userId',
          select: 'name'
        }
      })
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product by slug error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

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

export const getSimilarProducts = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 8 } = req.query;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    // Get the current product to find similar ones
    const currentProduct = await Product.findOne({
      _id: req.params.id,
      available: true,
      adminApproved: true
    }).lean();
    
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }



    let similarProducts=await Product.find({
      _id:{$ne: new mongoose.Types.ObjectId(id)},
      status:'active',
      available:true,
      $or:[
          {category: currentProduct.category},
          {categorySlug: currentProduct.categorySlug},
          {tags: {$in: currentProduct.tags}},
          {vendorId: currentProduct.vendorId}
          ]
      
    })
    .populate('vendorId', 'name email phone')
    .sort({price:-1,averageRating: -1, createdAt: -1})
    .limit(parseInt(limit))
    .lean()
    ;
    res.json({
      success: true,
      data: similarProducts
    });
  } catch (error) {
    console.error('Get similar products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch similar products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export const getProductsByCategory = asyncHandler(async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const { minPrice, maxPrice, sort = '-createdAt' } = req.query;

    const filter = {
      categorySlug: categorySlug.toLowerCase(),
      available: true,
      status: 'active'
    };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'price':
        sortOption = { price: 1 };
        break;
      case '-price':
        sortOption = { price: -1 };
        break;
      case 'createdAt':
        sortOption = { createdAt: 1 };
        break;
      case '-createdAt':
        sortOption = { createdAt: -1 };
        break;
      case 'rating':
        sortOption = { averageRating: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const products = await Product.find(filter)
      .populate('vendorId', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products by category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export const searchProducts = asyncHandler(async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, sort = '-createdAt' } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = { 
      available: true,
      status: 'active'
    };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    if (category) {
      filter.categorySlug = { $regex: category, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'price':
        sortOption = { price: 1 };
        break;
      case '-price':
        sortOption = { price: -1 };
        break;
      case 'createdAt':
        sortOption = { createdAt: 1 };
        break;
      case '-createdAt':
        sortOption = { createdAt: -1 };
        break;
      case 'rating':
        sortOption = { averageRating: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const products = await Product.find(filter)
      .populate('vendorId', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export const createProductReview = asyncHandler(async (req, res) => {
  try {
    const { stars, title, review } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({ 
      userId: req.user._id, 
      proId: product._id 
    });

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    // Create the review
    const newReview = await Review.create({
      userId: req.user._id,
      proId: product._id,
      stars,
      title,
      review
    });

    // Update product with new review count and average rating
    const allReviews = await Review.find({ proId: product._id, isActive: true });
    const starToNumber = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };
    const totalRating = allReviews.reduce((acc, item) => starToNumber[item.stars] + acc, 0);
    
    product.totalReviews = allReviews.length;
    product.averageRating = allReviews.length > 0 ? Math.round((totalRating / allReviews.length) * 10) / 10 : 0;

    await product.save();

    // Populate user info for response
          await newReview.populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: newReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export const getProductReviews = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const reviews = await Review.find({ 
      proId: req.params.id, 
      isActive: true 
    })
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
    
    const total = await Review.countDocuments({ 
      proId: req.params.id, 
      isActive: true 
    });

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { proId: product._id, isActive: true } },
      { $group: { 
        _id: '$stars', 
        count: { $sum: 1 } 
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        ratingDistribution,
        summary: {
          totalReviews: product.totalReviews,
          averageRating: product.averageRating
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export const updateProductReview = asyncHandler(async (req, res) => {
  try {
    const { stars, title, review } = req.body;
    const reviewDoc = await Review.findById(req.params.reviewId);

    if (!reviewDoc) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user owns this review
    if (reviewDoc.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
    }

    // Update review
    reviewDoc.stars = stars;
    reviewDoc.title = title;
    reviewDoc.review = review;
    await reviewDoc.save();

    // Recalculate product average rating
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const allReviews = await Review.find({ proId: product._id, isActive: true });
    const starToNumber = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };
    const totalRating = allReviews.reduce((acc, item) => starToNumber[item.stars] + acc, 0);
    
    product.totalReviews = allReviews.length;
    product.averageRating = allReviews.length > 0 ? Math.round((totalRating / allReviews.length) * 10) / 10 : 0;
    await product.save();

          await reviewDoc.populate('userId', 'name email');

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: reviewDoc
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export const deleteProductReview = asyncHandler(async (req, res) => {
  try {
    const reviewDoc = await Review.findById(req.params.reviewId);

    if (!reviewDoc) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user owns this review
    if (reviewDoc.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    // Soft delete by setting isActive to false
    reviewDoc.isActive = false;
    await reviewDoc.save();

    // Recalculate product average rating
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const allReviews = await Review.find({ proId: product._id, isActive: true });
    const starToNumber = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };
    const totalRating = allReviews.reduce((acc, item) => starToNumber[item.stars] + acc, 0);
    
    product.totalReviews = allReviews.length;
    product.averageRating = allReviews.length > 0 ? Math.round((totalRating / allReviews.length) * 10) / 10 : 0;
    await product.save();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}); 

export const addReviewResponse = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user is vendor for this product
    const product = await Product.findById(req.params.id);
    const isVendor = product && product.vendorId.toString() === req.user._id.toString();

    // Create response
    const response = {
      userId: req.user._id,
      content,
      isVendorResponse: isVendor
    };

    review.responses.push(response);
    await review.save();

    // Populate user info for response
    await review.populate('responses.userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Response added successfully',
      data: review.responses[review.responses.length - 1]
    });
  } catch (error) {
    console.error('Add review response error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export const updateReviewResponse = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const response = review.responses.id(req.params.responseId);
    if (!response) {
      return res.status(404).json({ success: false, message: 'Response not found' });
    }

    // Check if user owns this response
    if (response.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this response' });
    }

    response.content = content;
    await review.save();

    await review.populate('responses.userId', 'name email');

    res.json({
      success: true,
      message: 'Response updated successfully',
      data: response
    });
  } catch (error) {
    console.error('Update review response error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export const deleteReviewResponse = asyncHandler(async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const response = review.responses.id(req.params.responseId);
    if (!response) {
      return res.status(404).json({ success: false, message: 'Response not found' });
    }

    // Check if user owns this response
    if (response.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this response' });
    }

    response.remove();
    await review.save();

    res.json({
      success: true,
      message: 'Response deleted successfully'
    });
  } catch (error) {
    console.error('Delete review response error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}); 

export const addVendorReviewResponse = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;
    const vendorId = req.vendor._id;
    
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if this review is for a product owned by this vendor
    const product = await Product.findById(review.proId);
    if (!product || product.vendorId.toString() !== vendorId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this review' });
    }

    // Check if vendor already responded
    const existingResponse = review.responses.find(response => 
      response.userId.toString() === vendorId.toString() && response.isVendorResponse
    );

    if (existingResponse) {
      return res.status(400).json({ success: false, message: 'You have already responded to this review' });
    }

    // Add vendor response
    review.responses.push({
      userId: vendorId,
      content,
      isVendorResponse: true,
      createdAt: new Date()
    });

    await review.save();

    // Populate vendor info for response
    await review.populate('responses.userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Response added successfully',
      data: review.responses[review.responses.length - 1]
    });
  } catch (error) {
    console.error('Add vendor review response error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export const updateVendorReviewResponse = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;
    const vendorId = req.vendor._id;
    
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const response = review.responses.id(req.params.responseId);
    if (!response) {
      return res.status(404).json({ success: false, message: 'Response not found' });
    }

    // Check if vendor owns this response
    if (response.userId.toString() !== vendorId.toString() || !response.isVendorResponse) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this response' });
    }

    response.content = content;
    await review.save();

    await review.populate('responses.userId', 'name email');

    res.json({
      success: true,
      message: 'Response updated successfully',
      data: response
    });
  } catch (error) {
    console.error('Update vendor review response error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export const deleteVendorReviewResponse = asyncHandler(async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const response = review.responses.id(req.params.responseId);
    if (!response) {
      return res.status(404).json({ success: false, message: 'Response not found' });
    }

    // Check if vendor owns this response
    if (response.userId.toString() !== vendorId.toString() || !response.isVendorResponse) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this response' });
    }

    response.remove();
    await review.save();

    res.json({
      success: true,
      message: 'Response deleted successfully'
    });
  } catch (error) {
    console.error('Delete vendor review response error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}); 


export const getFrequentlyBoughtTogether = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      available: true,
      adminApproved: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const frequentlyBoughtTogether = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(4);

    res.json({ success: true, data: frequentlyBoughtTogether });
  } catch (error) {
    console.error('Get frequently bought together error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


export const getComparableProducts = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      available: true,
      adminApproved: true
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const comparableProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(4);

    res.json({ success: true, data: comparableProducts });
  } catch (error) {
    console.error('Get comparable products error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get available colors for products
export const getAvailableColors = asyncHandler(async (req, res) => {
  try {
    const { category } = req.query;
    
    // Build base filter
    const filter = {
      status: 'active',
      available: true,
      adminApproved: true,
      $or: [
        { vendor: { $ne: true } },
        { vendor: true, adminApproved: true }
      ]
    };

    // Add category filter if specified
    if (category) {
      filter.categorySlug = { $regex: category, $options: 'i' };
    }

    // Aggregate to get unique colors with counts
    const colorAggregation = await Product.aggregate([
      { $match: filter },
      { $unwind: { path: '$colorVariants', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          'colorVariants.isActive': true,
          'colorVariants.stock': { $gt: 0 }
        }
      },
      {
        $group: {
          _id: {
            colorName: '$colorVariants.colorName',
            colorCode: '$colorVariants.colorCode'
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          colorName: '$_id.colorName',
          colorCode: '$_id.colorCode',
          count: 1
        }
      },
      { $sort: { colorName: 1 } }
    ]);

    // Also get legacy colors
    const legacyColorAggregation = await Product.aggregate([
      { $match: filter },
      { $unwind: { path: '$colors', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          colors: { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$colors',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          colorName: '$_id',
          colorCode: null, // Legacy colors don't have color codes
          count: 1
        }
      },
      { $sort: { colorName: 1 } }
    ]);

    // Combine and deduplicate colors
    const allColors = [...colorAggregation, ...legacyColorAggregation];
    const colorMap = new Map();

    allColors.forEach(color => {
      const key = color.colorName.toLowerCase();
      if (colorMap.has(key)) {
        colorMap.get(key).count += color.count;
        // Use color code from colorVariants if available
        if (!colorMap.get(key).colorCode && color.colorCode) {
          colorMap.get(key).colorCode = color.colorCode;
        }
      } else {
        colorMap.set(key, {
          colorName: color.colorName,
          colorCode: color.colorCode || '#cccccc', // Default color for legacy colors
          count: color.count
        });
      }
    });

    const availableColors = Array.from(colorMap.values())
      .filter(color => color.count > 0)
      .sort((a, b) => a.colorName.localeCompare(b.colorName));

    res.json({
      success: true,
      data: availableColors,
      total: availableColors.length
    });
  } catch (error) {
    console.error('Get available colors error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}); 
