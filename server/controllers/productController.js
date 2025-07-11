import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import { uploadMultipleImages, deleteMultipleImages, updateImage } from '../utils/imageUpload.js';

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

    if (status) {
      filter.status = status;
    } else {
      filter.status = 'active';
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (category) {
      filter.categorySlug = { $regex: category, $options: 'i' };
    }

    if (vendor) {
      filter.vendorId = vendor;
    }

    // Collect $or conditions for size and color
    let orConditions = [];
    // Size filter (multi-select support, top-level and variant)
    if (size) {
      const sizeArray = size.split(',').map(s => s.trim()).filter(Boolean);
      if (sizeArray.length > 1) {
        orConditions.push({ 'variantDetails.size': { $in: sizeArray } });
        orConditions.push({ size: { $in: sizeArray } });
      } else {
        orConditions.push({ 'variantDetails.size': sizeArray[0] });
        orConditions.push({ size: sizeArray[0] });
      }
    }
    // Color filter
    if (colors) {
      const colorArray = colors.split(',').map(c => c.trim()).filter(Boolean);
      if (colorArray.length > 1) {
        orConditions.push({ colors: { $in: colorArray } });
        orConditions.push({ 'variantDetails.color': { $in: colorArray } });
      } else {
        orConditions.push({ colors: colorArray[0] });
        orConditions.push({ 'variantDetails.color': colorArray[0] });
      }
    }
    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }

    // Filter for vendor products only
    if (vendorOnly === 'true') {
      if (!req.vendor) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Vendor authentication required.' });
      }
      filter.vendor = true;
      filter.vendorId = req.vendor._id;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Availability filter
    if (req.query.availability === 'true') {
      filter.available = 'true';
      filter.$or = [
        { stock: { $gt: 0 } },
        { variantDetails: { $elemMatch: { stock: { $gt: 0 } } } }
      ];
    } else if (req.query.availability === 'false') {
      filter.available = 'false';
      filter.$or = [
        { stock: { $lte: 0 } },
        { variantDetails: { $elemMatch: { stock: { $lte: 0 } } } }
      ];
    }

    // Sorting
    let sortOption = {};
    if (sort === 'price') {
      sortOption = { price: 1 };
    } else if (sort === '-price') {
      sortOption = { price: -1 };
    } else if (sort === 'createdAt') {
      sortOption = { createdAt: 1 };
    } else if (sort === '-createdAt') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'discount') {
      sortOption = { discount: -1 };
    } else {
      sortOption = { createdAt: -1 };
    }

    // Execute query
    const products = await Product.find(filter)
      .populate('vendorId', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);
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
    res.status(500).json({ success: false, message: error.message });
  }
});


export const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendorId', 'name email phone')
      .populate({
        path: 'reviews',
        populate: {
          path: 'userId',
          select: 'name'
        }
      });

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('vendorId', 'name email phone')
    .populate({
      path: 'reviews',
      populate: {
        path: 'userId',
        select: 'name'
      }
    });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({
    success: true,
    data: product
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  if (!req.vendor) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Vendor authentication required.' });
  }
  try {
    const {
      name,
      price,
      mrp,
      discount,
      category,
      description,
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
      status,
      keyFeatures,
      productDetails,
      tags
    } = req.body;

    // Strong server-side validation
    const errors = [];
    if (!name || typeof name !== 'string' || !name.trim()) errors.push('Product name is required.');
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) errors.push('Valid price is required.');
    if (mrp === undefined || mrp === null || isNaN(Number(mrp)) || Number(mrp) < 0) errors.push('Valid MRP is required.');
    if (!category || typeof category !== 'string' || !category.trim()) errors.push('Category is required.');
    if (!req.files || req.files.length === 0) errors.push('At least one image is required.');
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(' ') });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Get category slug
    const categoryDoc = await Category.findOne({ name: category });
    let categorySlug = 'general'; // Default slug
    
    if (categoryDoc) {
      categorySlug = categoryDoc.slug;
    } else if (category === 'General') {
      // Use default slug for General category
      categorySlug = 'general';
    } else {
      // Generate slug from category name if not found
      categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Handle image uploads to Cloudinary
    let images = [];
    if (req.files && req.files.length > 0) {
      try {
        const imageBuffers = req.files.map(file => file.buffer);
        const uploadResults = await uploadMultipleImages(
          imageBuffers, 
          'weave-products', 
          `product_${slug}_${Date.now()}`
        );

        // Process upload results
        images = uploadResults.map((result, index) => ({
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
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images. Please try again.'
        });
      }
    }

    const product = await Product.create({
      name,
      slug,
      price,
      mrp,
      discount,
      vendorId: req.vendor._id,
      vendor: true,
      category,
      categorySlug,
      description,
      seoDescription,
      seoKeyword,
      seoTitle,
      pickup_location,
      return: returnPolicy,
      cancellation,
      variant,
      variantDetails: variant ? variantDetails : [],
      stock,
      colors,
      status,
      images,
      files: [], // Keep for backward compatibility
      keyFeatures,
      productDetails,
      tags
    });

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
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Check if vendor owns this product
    if (product.vendorId.toString() !== req.vendor._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this product');
    }

    // Strong server-side validation for update
    const errors = [];
    const { colors, mrp, price } = req.body;
    console.log(req)
    let images = product.images || [];
    if (mrp === undefined || mrp === null || isNaN(Number(mrp)) || Number(mrp) < 0) errors.push('Valid MRP is required.');
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) errors.push('Valid price is required.');
    // Check for at least one image (existing or new)
    if (req.body.existingImages) {
      try {
        const existingImages = JSON.parse(req.body.existingImages);
        images = existingImages;
      } catch (error) {
        console.error('Error parsing existingImages:', error);
        images = [];
      }
    }
    if (req.files && req.files.length > 0) {
      // Will add new images below
    }
    if ((!images || images.length === 0) && (!req.files || req.files.length === 0)) {
      errors.push('At least one image is required.');
    }
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(' ') });
    }

    if (colors) {
      req.body.colors = Array.isArray(colors) ? colors : [colors];
    }

    // Handle image updates
    // Handle existing images if provided
    if (req.body.existingImages) {
      try {
        const existingImages = JSON.parse(req.body.existingImages);
        images = existingImages;
      } catch (error) {
        console.error('Error parsing existingImages:', error);
        images = [];
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

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, images },
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

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Vendor)
export const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Check if vendor owns this product
    if (product.vendorId.toString() !== req.vendor._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this product');
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

    await Product.findByIdAndDelete(req.params.id);

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

// @desc    Get similar products
// @route   GET /api/products/:id/similar
// @access  Public
export const getSimilarProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const similarProducts = await Product.find({
    categorySlug: product.categorySlug,
    _id: { $ne: product._id },
    available: 'true'
  })
    .limit(8)
    .populate('vendorId', 'name');

  res.json({
    success: true,
    data: similarProducts
  });
});

// @desc    Get products by category
// @route   GET /api/products/category/:categorySlug
// @access  Public
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const { minPrice, maxPrice, sort = '-createdAt' } = req.query;

  const filter = {
    categorySlug: req.params.categorySlug,
    available: 'true'
  };

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  const products = await Product.find(filter)
    .populate('vendorId', 'name')
    .sort(sort)
    .skip(skip)
    .limit(limit);

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
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = asyncHandler(async (req, res) => {
  const { q, category, minPrice, maxPrice, sort = '-createdAt' } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const filter = { available: 'true' };

  if (q) {
    filter.name = { $regex: q, $options: 'i' };
  }

  if (category) {
    filter.categorySlug = { $regex: category, $options: 'i' };
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  const products = await Product.find(filter)
    .populate('vendorId', 'name')
    .sort(sort)
    .skip(skip)
    .limit(limit);

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
});

// @desc    Create a new review
// @route   POST /api/products/:id/reviews
// @access  Private (User)
export const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user already reviewed
  const alreadyReviewed = await Review.findOne({ 
    userId: req.user._id, 
    productId: product._id 
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Product already reviewed');
  }

  const review = await Review.create({
    userId: req.user._id,
    productId: product._id,
    rating: Number(rating),
    comment
  });

  // Update product with new review
  const updatedProduct = await Product.findById(product._id);
  updatedProduct.reviews.push(review._id);
  updatedProduct.totalReviews = updatedProduct.reviews.length;
  
  // Recalculate average rating
  const reviews = await Review.find({ productId: product._id });
  const totalRating = reviews.reduce((acc, item) => item.rating + acc, 0);
  updatedProduct.averageRating = totalRating / reviews.length;

  await updatedProduct.save();

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    data: review
  });
}); 