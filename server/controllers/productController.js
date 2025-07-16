import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import { uploadMultipleImages, deleteMultipleImages, updateImage } from '../utils/imageUpload.js';
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


// Get product by ID with reviews and rating distribution
export const getProductById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
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

    // Get reviews for this product
    const reviews = await Review.find({ 
      proId: id, 
      isActive: true 
    })
      .populate('userId', 'name')
      .populate('responses.userId', 'name')
      .sort({ createdAt: -1 });

    // Calculate average rating and total reviews
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => {
          const starToNumber = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };
          return sum + starToNumber[review.stars];
        }, 0) / totalReviews
      : 0;

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { proId: new mongoose.Types.ObjectId(id), isActive: true } },
      { $group: { _id: '$stars', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Update product with review data
    product.totalReviews = totalReviews;
    product.averageRating = averageRating;
    product.ratingDistribution = ratingDistribution;

    res.json({
      success: true,
      data: product,
      reviews,
      totalReviews,
      averageRating,
      ratingDistribution
    });
  } catch (error) {
    console.error('Error getting product:', error);
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

  // Update product with new review
    product.reviews.push(newReview._id);
    product.totalReviews = product.reviews.length;
  
  // Recalculate average rating
    const allReviews = await Review.find({ proId: product._id, isActive: true });
    const starToNumber = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };
    const totalRating = allReviews.reduce((acc, item) => starToNumber[item.stars] + acc, 0);
    product.averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

    await product.save();

    // Populate user info for response
    await newReview.populate('userId', 'name');

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

// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
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
    .populate('userId', 'name')
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

// @desc    Update user's review
// @route   PUT /api/products/:id/reviews/:reviewId
// @access  Private (User - own review only)
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
    const allReviews = await Review.find({ proId: product._id, isActive: true });
    const starToNumber = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };
    const totalRating = allReviews.reduce((acc, item) => starToNumber[item.stars] + acc, 0);
    product.averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;
    await product.save();

    await reviewDoc.populate('userId', 'name');

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

// @desc    Delete user's review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private (User - own review only)
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
    const allReviews = await Review.find({ proId: product._id, isActive: true });
    const starToNumber = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };
    const totalRating = allReviews.reduce((acc, item) => starToNumber[item.stars] + acc, 0);
    product.averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;
    product.totalReviews = allReviews.length;
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

// @desc    Add response to a review
// @route   POST /api/products/:id/reviews/:reviewId/responses
// @access  Private (User/Vendor)
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
    await review.populate('responses.userId', 'name');

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

// @desc    Update response to a review
// @route   PUT /api/products/:id/reviews/:reviewId/responses/:responseId
// @access  Private (Response owner only)
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

    await review.populate('responses.userId', 'name');

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

// @desc    Delete response to a review
// @route   DELETE /api/products/:id/reviews/:reviewId/responses/:responseId
// @access  Private (Response owner only)
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



// @desc    Add vendor response to a review
// @route   POST /api/products/vendor/reviews/:reviewId/responses
// @access  Private (Vendor only)
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

// @desc    Update vendor response to a review
// @route   PUT /api/products/vendor/reviews/:reviewId/responses/:responseId
// @access  Private (Vendor only)
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

// @desc    Delete vendor response to a review
// @route   DELETE /api/products/vendor/reviews/:reviewId/responses/:responseId
// @access  Private (Vendor only)
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