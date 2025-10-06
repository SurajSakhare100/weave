import asyncHandler from 'express-async-handler';
import Product from '../../models/Product.js';
import mongoose from 'mongoose';

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
