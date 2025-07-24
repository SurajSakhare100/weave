import asyncHandler from 'express-async-handler';
import Vendor from '../models/Vendor.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import { createVendorProduct } from '../helpers/vendorHelpers.js';


export const getVendorProfile = asyncHandler(async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id).select('-password');

    if (!vendor) {
      res.status(404);
      throw new Error('Vendor not found');
    }

    res.json({
      success: true,
      data: vendor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


export const updateVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.vendor._id);

  if (!vendor) {
    res.status(404);
    throw new Error('Vendor not found');
  }

  const { name, email, phone, address, gstin, pan } = req.body;

  // Check if email is being changed and if it's already taken
  if (email && email !== vendor.email) {
    const emailExists = await Vendor.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already exists');
    }
  }

  vendor.name = name || vendor.name;
  vendor.email = email || vendor.email;
  vendor.phone = phone || vendor.phone;
  vendor.address = address || vendor.address;
  vendor.gstin = gstin || vendor.gstin;
  vendor.pan = pan || vendor.pan;

  const updatedVendor = await vendor.save();

  res.json({
    success: true,
    data: {
      _id: updatedVendor._id,
      name: updatedVendor.name,
      email: updatedVendor.email,
      phone: updatedVendor.phone,
      address: updatedVendor.address,
      gstin: updatedVendor.gstin,
      pan: updatedVendor.pan,
      isApproved: updatedVendor.isApproved,
      createdAt: updatedVendor.createdAt
    }
  });
});


export const getVendorDashboard = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;

  // Get recent products
  const recentProducts = await Product.find({ vendorId })
    .sort('-createdAt')
    .limit(5);

  // Get product statistics
  const productStats = await Product.aggregate([
    { $match: { vendorId } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        activeProducts: {
          $sum: { $cond: [{ $eq: ['$available', 'true'] }, 1, 0] }
        },
        inactiveProducts: {
          $sum: { $cond: [{ $eq: ['$available', 'false'] }, 1, 0] }
        }
      }
    }
  ]);

  // Get order statistics
  const orderStats = await Order.aggregate([
    {
      $match: {
        'orderItems.productId': {
          $in: await Product.find({ vendorId }).distinct('_id')
        }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        }
      }
    }
  ]);

  // Get recent orders
  const recentOrders = await Order.find({
    'orderItems.productId': {
      $in: await Product.find({ vendorId }).distinct('_id')
    }
  })
    .populate('orderItems.productId', 'name price')
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(5);

  res.json({
    success: true,
    data: {
      recentProducts,
      productStats: productStats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0
      },
      orderStats: orderStats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0
      },
      recentOrders
    }
  });
});


export const getVendors = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const { search, status } = req.query;

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (status) {
    filter.isApproved = status === 'approved';
  }

  const vendors = await Vendor.find(filter)
    .select('-password')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Vendor.countDocuments(filter);

  res.json({
    success: true,
    data: vendors,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});


export const getVendorById = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id).select('-password');

  if (!vendor) {
    res.status(404);
    throw new Error('Vendor not found');
  }

  res.json({
    success: true,
    data: vendor
  });
});


export const updateVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    res.status(404);
    throw new Error('Vendor not found');
  }

  const { name, email, phone, address, gstin, pan, isApproved } = req.body;

  // Check if email is being changed and if it's already taken
  if (email && email !== vendor.email) {
    const emailExists = await Vendor.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already exists');
    }
  }

  vendor.name = name || vendor.name;
  vendor.email = email || vendor.email;
  vendor.phone = phone || vendor.phone;
  vendor.address = address || vendor.address;
  vendor.gstin = gstin || vendor.gstin;
  vendor.pan = pan || vendor.pan;
  vendor.isApproved = isApproved !== undefined ? isApproved : vendor.isApproved;

  const updatedVendor = await vendor.save();

  res.json({
    success: true,
    data: {
      _id: updatedVendor._id,
      name: updatedVendor.name,
      email: updatedVendor.email,
      phone: updatedVendor.phone,
      address: updatedVendor.address,
      gstin: updatedVendor.gstin,
      pan: updatedVendor.pan,
      isApproved: updatedVendor.isApproved,
      createdAt: updatedVendor.createdAt
    }
  });
});


export const deleteVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    res.status(404);
    throw new Error('Vendor not found');
  }

  // Check if vendor has products
  const productCount = await Product.countDocuments({ vendorId: req.params.id });
  if (productCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete vendor. Vendor has ${productCount} products.`);
  }

  await Vendor.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Vendor deleted successfully'
  });
});


export const getVendorProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const products = await Product.find({ vendorId: req.params.id })
    .populate('category', 'name')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments({ vendorId: req.params.id });

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


export const getVendorOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const vendorProducts = await Product.find({ vendorId: req.params.id }).distinct('_id');

  const orders = await Order.find({
    'orderItems.productId': { $in: vendorProducts }
  })
    .populate('orderItems.productId', 'name price')
    .populate('user', 'name email')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments({
    'orderItems.productId': { $in: vendorProducts }
  });

  res.json({
    success: true,
    data: orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});


export const getVendorStats = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  const days = parseInt(period);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await Vendor.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalVendors: { $sum: 1 },
        approvedVendors: {
          $sum: { $cond: ['$isApproved', 1, 0] }
        },
        pendingVendors: {
          $sum: { $cond: ['$isApproved', 0, 1] }
        }
      }
    }
  ]);

  const dailyStats = await Vendor.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        vendors: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  const totalVendors = await Vendor.countDocuments();
  const approvedVendors = await Vendor.countDocuments({ isApproved: true });

  res.json({
    success: true,
    data: {
      summary: stats[0] || {
        totalVendors: 0,
        approvedVendors: 0,
        pendingVendors: 0
      },
      overall: {
        totalVendors,
        approvedVendors,
        pendingVendors: totalVendors - approvedVendors
      },
      dailyStats
    }
  });
});

// @desc    Create a new product (Vendor)
// @route   POST /api/vendors/products
// @access  Private (Vendor)
export const createVendorProductController = asyncHandler(async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const productData = req.body;
    // Images are available as req.files (from multer)
    const imageFiles = req.files || [];
    const product = await createVendorProduct(productData, imageFiles, vendorId);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get vendor product reviews
// @route   GET /api/vendors/reviews
// @access  Private (Vendor)
export const getVendorReviews = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { productId, rating, sort = '-createdAt' } = req.query;

    // Get vendor's product IDs
    const vendorProducts = await Product.find({ vendorId: req.vendor._id }).distinct('_id');

    // Build filter
    const filter = {
      proId: { $in: vendorProducts },
      isActive: true
    };

    if (productId) {
      filter.proId = productId;
    }

    if (rating) {
      filter.stars = rating;
    }

    // Get reviews
    const reviews = await Review.find(filter)
      .populate('userId', 'name email')
      .populate('proId', 'name images')
      .populate('responses.userId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(filter);

    // Get review statistics
    const reviewStats = await Review.aggregate([
      { $match: { proId: { $in: vendorProducts }, isActive: true } },
      {
        $addFields: {
          ratingNumber: {
            $switch: {
              branches: [
                { case: { $eq: ['$stars', 'one'] }, then: 1 },
                { case: { $eq: ['$stars', 'two'] }, then: 2 },
                { case: { $eq: ['$stars', 'three'] }, then: 3 },
                { case: { $eq: ['$stars', 'four'] }, then: 4 },
                { case: { $eq: ['$stars', 'five'] }, then: 5 }
              ],
              default: 0
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$ratingNumber' },
          ratingDistribution: {
            $push: '$stars'
          }
        }
      }
    ]);

    // Calculate rating distribution
    const ratingCounts = { one: 0, two: 0, three: 0, four: 0, five: 0 };
    if (reviewStats.length > 0) {
      reviewStats[0].ratingDistribution.forEach(rating => {
        ratingCounts[rating]++;
      });
    }

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
        stats: {
          totalReviews: reviewStats[0]?.totalReviews || 0,
          averageRating: reviewStats[0]?.averageRating || 0,
          ratingDistribution: ratingCounts
        }
      }
    });
  } catch (error) {
    console.error('Get vendor reviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get vendor review analytics
// @route   GET /api/vendors/reviews/analytics
// @access  Private (Vendor)
export const getVendorReviewAnalytics = asyncHandler(async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all products by this vendor
    const vendorProducts = await Product.find({ vendorId }).select('_id');
    const productIds = vendorProducts.map(product => product._id);

    // Get reviews for vendor's products
    const reviews = await Review.find({ 
      proId: { $in: productIds },
      isActive: true 
    });

    // Calculate analytics
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => {
          const starToNumber = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };
          return sum + starToNumber[review.stars];
        }, 0) / totalReviews
      : 0;

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { proId: { $in: productIds }, isActive: true } },
      { $group: { _id: '$stars', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Get recent reviews (last 30 days)
    const recentReviews = await Review.countDocuments({
      proId: { $in: productIds },
      isActive: true,
      createdAt: { $gte: startDate }
    });

    // Calculate response rate
    const reviewsWithResponses = reviews.filter(review => review.responses.length > 0).length;
    const responseRate = totalReviews > 0 ? Math.round((reviewsWithResponses / totalReviews) * 100) : 0;

    // Get verified reviews
    const verifiedReviews = reviews.filter(review => review.isVerified).length;

    res.json({
      success: true,
      data: {
        totalReviews,
        averageRating,
        ratingDistribution,
        recentReviews,
        responseRate,
        verifiedReviews
      }
    });
  } catch (error) {
    console.error('Error getting vendor review analytics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}); 

// @desc    Get vendor earnings analytics
// @route   GET /api/vendors/earnings
// @access  Private (Vendor)
export const getVendorEarnings = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;
  console.log('Vendor ID:', vendorId);
  
  const vendorProductIds = await Product.find({ vendorId }).distinct('_id');
  console.log('Vendor product IDs:', vendorProductIds);

  // Get all orders - handle both orderItems and order structures
  const orders = await Order.find({
    $or: [
      { 'orderItems.productId': { $in: vendorProductIds } },
      { 'order.product': { $in: vendorProductIds } }
    ]
  });
  console.log('Found orders:', orders.length);

  let totalEarnings = 0;
  let balance = 0;
  let totalSalesValue = 0;
  const monthMap = {};
  const countryMap = {};
  const earningsTable = [];

  orders.forEach(order => {
    let vendorOrderTotal = 0;
    let vendorOrderCount = 0;
    let orderStatus = 'Pending';
    let orderDate = order.createdAt;

    // Handle orderItems structure (new format)
    if (order.orderItems && order.orderItems.length > 0) {
      order.orderItems.forEach(item => {
        if (vendorProductIds.some(id => id.equals(item.productId))) {
          vendorOrderTotal += item.price * item.quantity;
          vendorOrderCount += item.quantity;
        }
      });
      
      // Determine order status and use appropriate date
      if (order.isDelivered) {
        orderStatus = 'Paid';
        // Use deliveredAt if available, otherwise use paidAt, fallback to createdAt
        orderDate = order.deliveredAt || order.paidAt || order.createdAt;
      } else if (order.isPaid) {
        orderStatus = 'Paid';
        orderDate = order.paidAt || order.createdAt;
      } else {
        orderStatus = 'Pending';
        orderDate = order.createdAt;
      }
    }
    // Handle legacy order structure
    else if (order.order && order.order.length > 0) {
      order.order.forEach(item => {
        if (vendorProductIds.some(id => id.equals(item.product))) {
          vendorOrderTotal += item.price * item.quantity;
          vendorOrderCount += item.quantity;
        }
      });
      
      // Use order creation date for legacy orders
      orderStatus = order.isDelivered ? 'Paid' : 'Pending';
      orderDate = order.createdAt;
    }

    // Update totals
    if (orderStatus === 'Paid') {
      totalEarnings += vendorOrderTotal;
    } else {
      balance += vendorOrderTotal;
    }
    totalSalesValue += vendorOrderTotal;

    // Month breakdown using actual order date
    const month = orderDate.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!monthMap[month]) monthMap[month] = { totalSales: 0, customerCost: 0 };
    monthMap[month].totalSales += vendorOrderTotal;
    monthMap[month].customerCost += vendorOrderCount;

    // Country breakdown - use state as country if country is not available
    const country = order.shippingAddress?.country || order.shippingAddress?.state || 'Unknown';
    if (!countryMap[country]) countryMap[country] = 0;
    countryMap[country] += vendorOrderTotal;

    // Earnings table row
    earningsTable.push({
      date: orderDate.toISOString(),
      status: orderStatus,
      productSalesCount: vendorOrderCount,
      earnings: vendorOrderTotal
    });
  });

  // Format month breakdown
  const monthlySales = Object.entries(monthMap).map(([month, data]) => ({
    month,
    totalSales: data.totalSales,
    customerCost: data.customerCost
  })).sort((a, b) => new Date(a.month) - new Date(b.month));

  // Format top countries
  const topCountries = Object.entries(countryMap)
    .map(([country, total]) => ({ country, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // Sort earnings table by date desc
  earningsTable.sort((a, b) => new Date(b.date) - new Date(a.date));

  const responseData = {
    totalEarnings,
    balance,
    totalSalesValue,
    monthlySales,
    topCountries,
    earningsTable
  };
  
  console.log('Earnings response data:', responseData);
  
  res.json({
    success: true,
    data: responseData
  });
}); 

// @desc    Get vendor released products with analytics
// @route   GET /api/vendors/products/released
// @access  Private (Vendor)
export const getVendorReleasedProducts = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const skip = (page - 1) * limit;

  // Build search query
  const searchQuery = {
    vendorId,
    available: 'true', // Only released products
    status: 'active', // Only active products
    ...(search && { name: { $regex: search, $options: 'i' } })
  };

  // Get products with basic info
  const products = await Product.find(searchQuery)
    .populate('category', 'name')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await Product.countDocuments(searchQuery);

  // Get analytics data for each product
  const productsWithAnalytics = await Promise.all(
    products.map(async (product) => {
      // Get sales data from orders
      const orderItems = await Order.aggregate([
        {
          $unwind: '$orderItems'
        },
        {
          $match: {
            'orderItems.productId': product._id,
            isPaid: true
          }
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
            totalQuantity: { $sum: '$orderItems.quantity' },
            orderCount: { $sum: 1 }
          }
        }
      ]);

      // Get reviews data
      const reviews = await Review.find({ proId: product._id });
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => {
            const ratingMap = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };
            return sum + (ratingMap[review.stars] || 0);
          }, 0) / reviews.length
        : 0;

      // Get views data (mock for now - you can implement actual view tracking)
      const views = Math.floor(Math.random() * 2000) + 100; // Mock data

      // Calculate sales growth (mock for now)
      const salesGrowth = Math.floor(Math.random() * 50) + 10; // Mock data

      const analytics = orderItems[0] || { totalSales: 0, totalQuantity: 0, orderCount: 0 };

      // Get primary image from Cloudinary images array
      let primaryImageUrl = '/products/product.png'; // fallback
      let allImages = [];
      
      if (product.images && product.images.length > 0) {
        // Use Cloudinary images
        allImages = product.images.map(img => img.url);
        const primaryImage = product.images.find(img => img.is_primary) || product.images[0];
        primaryImageUrl = primaryImage.url;
      } else if (product.files && product.files.length > 0) {
        // Fallback to legacy files field
        allImages = product.files;
        primaryImageUrl = product.files[0];
      }

      return {
        _id: product._id,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        status: 'active',
        sales: analytics.totalQuantity || 0,
        salesGrowth: salesGrowth,
        views: views,
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length,
        files: allImages, // Use all images from Cloudinary
        primaryImage: primaryImageUrl, // Primary image for display
        available: product.available,
        stock: product.stock,
        colors: product.colors,
        totalReviews: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10,
        discount: product.discount,
        vendorId: product.vendorId,
        vendor: product.vendor,
        description: product.description,
        pickup_location: product.pickup_location,
        return: product.return,
        cancellation: product.cancellation,
        category: product.category,
        variant: product.variant,
        variantDetails: product.variantDetails,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        __v: product.__v,
        slug: product.slug
      };
    })
  );

  res.json({
    success: true,
    data: productsWithAnalytics,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}); 

// @desc    Unpublish multiple vendor products
// @route   POST /api/vendors/products/unpublish
// @access  Private (Vendor)
export const unpublishVendorProducts = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    res.status(400);
    throw new Error('Product IDs are required');
  }

  // Verify all products belong to the vendor
  const products = await Product.find({
    _id: { $in: productIds },
    vendorId
  });

  if (products.length !== productIds.length) {
    res.status(400);
    throw new Error('Some products not found or do not belong to you');
  }

  // Update products status to draft
  const result = await Product.updateMany(
    {
      _id: { $in: productIds },
      vendorId
    },
    {
      status: 'draft'
    }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} products moved to draft successfully`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

// @desc    Delete multiple vendor products
// @route   DELETE /api/vendors/products/bulk
// @access  Private (Vendor)
export const deleteVendorProducts = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    res.status(400);
    throw new Error('Product IDs are required');
  }

  // Verify all products belong to the vendor
  const products = await Product.find({
    _id: { $in: productIds },
    vendorId
  });

  if (products.length !== productIds.length) {
    res.status(400);
    throw new Error('Some products not found or do not belong to you');
  }

  // Delete products
  const result = await Product.deleteMany({
    _id: { $in: productIds },
    vendorId
  });

  res.json({
    success: true,
    message: `${result.deletedCount} products deleted successfully`,
    data: {
      deletedCount: result.deletedCount
    }
  });
}); 

// @desc    Get vendor draft products
// @route   GET /api/vendors/products/drafts
// @access  Private (Vendor)
export const getVendorDraftProducts = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const skip = (page - 1) * limit;

  // Build search query for draft products
  const searchQuery = {
    vendorId,
    status: 'draft', // Only draft products
    ...(search && { name: { $regex: search, $options: 'i' } })
  };

  // Get products with basic info
  const products = await Product.find(searchQuery)
    .populate('category', 'name')
    .sort('-updatedAt') // Sort by last edited
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await Product.countDocuments(searchQuery);

  // Format products with Cloudinary images
  const formattedProducts = products.map((product) => {
    // Get primary image from Cloudinary images array
    let primaryImageUrl = '/products/product.png'; // fallback
    let allImages = [];
    
    if (product.images && product.images.length > 0) {
      // Use Cloudinary images
      allImages = product.images.map(img => img.url);
      const primaryImage = product.images.find(img => img.is_primary) || product.images[0];
      primaryImageUrl = primaryImage.url;
    } else if (product.files && product.files.length > 0) {
      // Fallback to legacy files field
      allImages = product.files;
      primaryImageUrl = product.files[0];
    }

    // Format last edited date
    const lastEdited = product.updatedAt ? 
      new Date(product.updatedAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }) : '3D Product';

    return {
      _id: product._id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      status: product.status,
      files: allImages, // Use all images from Cloudinary
      primaryImage: primaryImageUrl, // Primary image for display
      available: product.available,
      stock: product.stock,
      colors: product.colors,
      totalReviews: product.totalReviews || 0,
      averageRating: product.averageRating || 0,
      discount: product.discount,
      vendorId: product.vendorId,
      vendor: product.vendor,
      description: product.description,
      pickup_location: product.pickup_location,
      return: product.return,
      cancellation: product.cancellation,
      category: product.category,
      variant: product.variant,
      variantDetails: product.variantDetails,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      __v: product.__v,
      slug: product.slug,
      lastEdited: lastEdited
    };
  });

  res.json({
    success: true,
    data: formattedProducts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}); 

// @desc    Publish multiple vendor products
// @route   POST /api/vendors/products/publish
// @access  Private (Vendor)
export const publishVendorProducts = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    res.status(400);
    throw new Error('Product IDs are required');
  }

  // Verify all products belong to the vendor
  const products = await Product.find({
    _id: { $in: productIds },
    vendorId
  });

  if (products.length !== productIds.length) {
    res.status(400);
    throw new Error('Some products not found or do not belong to you');
  }

  // Update products status to active
  const result = await Product.updateMany(
    {
      _id: { $in: productIds },
      vendorId
    },
    {
      status: 'active',
      available: 'true'
    }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} products published successfully`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
}); 

// @desc    Get vendor scheduled products
// @route   GET /api/vendors/products/scheduled
// @access  Private (Vendor)
export const getVendorScheduledProducts = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';

  // Build filter
  const filter = {
    vendorId,
    isScheduled: true,
    scheduleStatus: 'pending'
  };

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  // Get total count
  const total = await Product.countDocuments(filter);

  // Get scheduled products
  const products = await Product.find(filter)
    .sort({ scheduledPublishDate: 1, scheduledPublishTime: 1 })
    .skip(skip)
    .limit(limit);

  // Format products with Cloudinary images
  const formattedProducts = products.map((product) => {
    // Get primary image from Cloudinary images array
    let primaryImageUrl = '/products/product.png'; // fallback
    let allImages = [];
    
    if (product.images && product.images.length > 0) {
      // Use Cloudinary images
      allImages = product.images.map(img => img.url);
      const primaryImage = product.images.find(img => img.is_primary) || product.images[0];
      primaryImageUrl = primaryImage.url;
    } else if (product.files && product.files.length > 0) {
      // Fallback to legacy files field
      allImages = product.files;
      primaryImageUrl = product.files[0];
    }

    // Format scheduled date
    const scheduledDate = product.scheduledPublishDate ? 
      new Date(product.scheduledPublishDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }) : '';

    // Format last edited date
    const lastEdited = product.updatedAt ? 
      new Date(product.updatedAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }) : '3D Product';

    return {
      _id: product._id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      status: product.status,
      files: allImages,
      primaryImage: primaryImageUrl,
      available: product.available,
      stock: product.stock,
      colors: product.colors,
      totalReviews: product.totalReviews || 0,
      averageRating: product.averageRating || 0,
      discount: product.discount,
      vendorId: product.vendorId,
      vendor: product.vendor,
      description: product.description,
      pickup_location: product.pickup_location,
      return: product.return,
      cancellation: product.cancellation,
      category: product.category,
      variant: product.variant,
      variantDetails: product.variantDetails,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      __v: product.__v,
      slug: product.slug,
      lastEdited: lastEdited,
      isScheduled: product.isScheduled,
      scheduledPublishDate: product.scheduledPublishDate,
      scheduledPublishTime: product.scheduledPublishTime,
      scheduleStatus: product.scheduleStatus,
      scheduledDate: scheduledDate
    };
  });

  res.json({
    success: true,
    data: {
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Schedule products for publishing
// @route   POST /api/vendors/products/schedule
// @access  Private (Vendor)
export const scheduleVendorProducts = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;
  const { productIds, scheduledDate, scheduledTime } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    res.status(400);
    throw new Error('Product IDs are required');
  }

  if (!scheduledDate || !scheduledTime) {
    res.status(400);
    throw new Error('Scheduled date and time are required');
  }

  // Validate that scheduled date is in the future
  const scheduledDateTime = new Date(`${scheduledDate} ${scheduledTime}`);
  const now = new Date();
  
  if (scheduledDateTime <= now) {
    res.status(400);
    throw new Error('Scheduled date and time must be in the future');
  }

  // Verify all products belong to the vendor
  const products = await Product.find({
    _id: { $in: productIds },
    vendorId
  });

  if (products.length !== productIds.length) {
    res.status(400);
    throw new Error('Some products not found or do not belong to you');
  }

  // Update products to scheduled status
  const result = await Product.updateMany(
    {
      _id: { $in: productIds },
      vendorId
    },
    {
      isScheduled: true,
      scheduledPublishDate: scheduledDate,
      scheduledPublishTime: scheduledTime,
      scheduleStatus: 'pending',
      status: 'scheduled'
    }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} products scheduled successfully`,
    data: {
      modifiedCount: result.modifiedCount,
      scheduledDate,
      scheduledTime
    }
  });
});

// @desc    Reschedule products
// @route   PUT /api/vendors/products/reschedule
// @access  Private (Vendor)
export const rescheduleVendorProducts = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;
  const { productIds, scheduledDate, scheduledTime } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    res.status(400);
    throw new Error('Product IDs are required');
  }

  if (!scheduledDate || !scheduledTime) {
    res.status(400);
    throw new Error('Scheduled date and time are required');
  }

  // Validate that scheduled date is in the future
  const scheduledDateTime = new Date(`${scheduledDate} ${scheduledTime}`);
  const now = new Date();
  
  if (scheduledDateTime <= now) {
    res.status(400);
    throw new Error('Scheduled date and time must be in the future');
  }

  // Verify all products belong to the vendor and are scheduled
  const products = await Product.find({
    _id: { $in: productIds },
    vendorId,
    isScheduled: true,
    scheduleStatus: 'pending'
  });

  if (products.length !== productIds.length) {
    res.status(400);
    throw new Error('Some products not found, do not belong to you, or are not scheduled');
  }

  // Update products with new schedule
  const result = await Product.updateMany(
    {
      _id: { $in: productIds },
      vendorId,
      isScheduled: true,
      scheduleStatus: 'pending'
    },
    {
      scheduledPublishDate: scheduledDate,
      scheduledPublishTime: scheduledTime
    }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} products rescheduled successfully`,
    data: {
      modifiedCount: result.modifiedCount,
      scheduledDate,
      scheduledTime
    }
  });
});

// @desc    Cancel scheduled products
// @route   POST /api/vendors/products/cancel-schedule
// @access  Private (Vendor)
export const cancelScheduledProducts = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    res.status(400);
    throw new Error('Product IDs are required');
  }

  // Verify all products belong to the vendor and are scheduled
  const products = await Product.find({
    _id: { $in: productIds },
    vendorId,
    isScheduled: true,
    scheduleStatus: 'pending'
  });

  if (products.length !== productIds.length) {
    res.status(400);
    throw new Error('Some products not found, do not belong to you, or are not scheduled');
  }

  // Update products to cancel scheduling
  const result = await Product.updateMany(
    {
      _id: { $in: productIds },
      vendorId,
      isScheduled: true,
      scheduleStatus: 'pending'
    },
    {
      isScheduled: false,
      scheduledPublishDate: null,
      scheduledPublishTime: null,
      scheduleStatus: 'cancelled',
      status: 'draft'
    }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} scheduled products cancelled successfully`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

// @desc    Publish scheduled products immediately
// @route   POST /api/vendors/products/publish-scheduled
// @access  Private (Vendor)
export const publishScheduledProducts = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    res.status(400);
    throw new Error('Product IDs are required');
  }

  // Verify all products belong to the vendor and are scheduled
  const products = await Product.find({
    _id: { $in: productIds },
    vendorId,
    isScheduled: true,
    scheduleStatus: 'pending'
  });

  if (products.length !== productIds.length) {
    res.status(400);
    throw new Error('Some products not found, do not belong to you, or are not scheduled');
  }

  // Update products to published status
  const result = await Product.updateMany(
    {
      _id: { $in: productIds },
      vendorId,
      isScheduled: true,
      scheduleStatus: 'pending'
    },
    {
      isScheduled: false,
      scheduledPublishDate: null,
      scheduledPublishTime: null,
      scheduleStatus: 'published',
      status: 'active',
      available: 'true'
    }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} scheduled products published successfully`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
}); 