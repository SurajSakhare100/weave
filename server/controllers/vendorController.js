import asyncHandler from 'express-async-handler';
import Vendor from '../models/Vendor.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import { createVendorProduct } from '../helpers/vendorHelpers.js';

// @desc    Get vendor profile
// @route   GET /api/vendors/profile
// @access  Private (Vendor)
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

// @desc    Update vendor profile
// @route   PUT /api/vendors/profile
// @access  Private (Vendor)
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

// @desc    Get vendor dashboard
// @route   GET /api/vendors/dashboard
// @access  Private (Vendor)
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

// @desc    Get all vendors (Admin)
// @route   GET /api/vendors
// @access  Private/Admin
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

// @desc    Get vendor by ID (Admin)
// @route   GET /api/vendors/:id
// @access  Private/Admin
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

// @desc    Update vendor (Admin)
// @route   PUT /api/vendors/:id
// @access  Private/Admin
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

// @desc    Delete vendor (Admin)
// @route   DELETE /api/vendors/:id
// @access  Private/Admin
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

// @desc    Get vendor products (Admin)
// @route   GET /api/vendors/:id/products
// @access  Private/Admin
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

// @desc    Get vendor orders (Admin)
// @route   GET /api/vendors/:id/orders
// @access  Private/Admin
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

// @desc    Get vendor statistics (Admin)
// @route   GET /api/vendors/stats
// @access  Private/Admin
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