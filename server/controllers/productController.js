import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';

// @desc    Get all products with pagination and filtering
// @route   GET /api/products
// @access  Public (with optional vendor auth)
export const getProducts = asyncHandler(async (req, res) => {
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
    size
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

  if (size) {
    filter['variantDetails.size'] = size;
  }

  // Filter for vendor products only
  if (vendorOnly === 'true') {
    filter.vendor = true;
    // If vendor is authenticated, filter by their specific ID
    if (req.vendor) {
      filter.vendorId = req.vendor._id;
    }
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
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
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
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
});

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
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

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Vendor)
export const createProduct = asyncHandler(async (req, res) => {
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
    status
  } = req.body;

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
    files: req.files ? req.files.map(file => file.filename) : []
  });

  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Vendor)
export const updateProduct = asyncHandler(async (req, res) => {
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

  const { colors, stock, status } = req.body;
  if (colors) {
    req.body.colors = Array.isArray(colors) ? colors : [colors];
  }

  // Handle file uploads
  let files = product.files;
  
  // Handle existing images if provided
  if (req.body.existingImages) {
    try {
      const existingImages = JSON.parse(req.body.existingImages);
      files = existingImages;
    } catch (error) {
      console.error('Error parsing existingImages:', error);
      files = [];
    }
  }
  
  // Add new uploaded files
  if (req.files && req.files.length > 0) {
    files = [...files, ...req.files.map(file => file.filename)];
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { ...req.body, files },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: updatedProduct
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Vendor)
export const deleteProduct = asyncHandler(async (req, res) => {
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

  await Product.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
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