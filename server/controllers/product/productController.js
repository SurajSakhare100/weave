import asyncHandler from 'express-async-handler';
import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import Review from '../../models/Review.js';
import { uploadMultipleImages, deleteMultipleImages } from '../../utils/imageUpload.js';
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
