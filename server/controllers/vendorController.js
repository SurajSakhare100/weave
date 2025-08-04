import asyncHandler from 'express-async-handler';
import Vendor from '../models/Vendor.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import { createVendorProduct, updateVendorProduct as updateVendorProductHelper } from '../helpers/vendorHelpers.js';


export const getVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.vendor._id).select('-password');

  if (!vendor) {
    res.status(404);
    throw new Error('Vendor not found');
  }

  // Get approval status from middleware
  const approvalStatus = req.vendorApprovalStatus || {
    isApproved: vendor.adminApproved,
    rejectionReason: vendor.adminRejectionReason,
    needsApproval: !vendor.adminApproved
  };

  res.json({
    success: true,
    data: {
      ...vendor.toObject(),
      approvalStatus
    }
  });
});


export const updateVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.vendor._id);

  if (!vendor) {
    res.status(404);
    throw new Error('Vendor not found');
  }

  const { name, email, number, businessName, address, city, state, pinCode } = req.body;

  // Validate required fields
  if (name && name.trim().length === 0) {
    res.status(400);
    throw new Error('Name cannot be empty');
  }

  if (email && email.trim().length === 0) {
    res.status(400);
    throw new Error('Email cannot be empty');
  }

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
  vendor.number = number || vendor.number;
  vendor.businessName = businessName || vendor.businessName;
  vendor.address = address || vendor.address;
  vendor.city = city || vendor.city;
  vendor.state = state || vendor.state;
  vendor.pinCode = pinCode || vendor.pinCode;

  const updatedVendor = await vendor.save();

  res.json({
    success: true,
    data: {
      _id: updatedVendor._id,
      name: updatedVendor.name,
      email: updatedVendor.email,
      number: updatedVendor.number,
      businessName: updatedVendor.businessName,
      address: updatedVendor.address,
      city: updatedVendor.city,
      state: updatedVendor.state,
      pinCode: updatedVendor.pinCode,
      status: updatedVendor.status,
      adminApproved: updatedVendor.adminApproved,
      adminApprovedAt: updatedVendor.adminApprovedAt,
      adminApprovedBy: updatedVendor.adminApprovedBy,
      adminRejectionReason: updatedVendor.adminRejectionReason,
      adminApprovalFeedback: updatedVendor.adminApprovalFeedback,
      createdAt: updatedVendor.createdAt,
      updatedAt: updatedVendor.updatedAt
    }
  });
});


export const getVendorDashboard = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;

  // Get approval status from middleware
  const approvalStatus = req.vendorApprovalStatus || {
    isApproved: req.vendor.adminApproved,
    rejectionReason: req.vendor.adminRejectionReason,
    needsApproval: !req.vendor.adminApproved
  };

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
      approvalStatus,
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
  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 10;

  const { search, status } = req.query;
  const filter = { status: { $ne: 'deleted' } }; // Exclude deleted vendors

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { businessName: { $regex: search, $options: 'i' } }
    ];
  }

  if (status && status !== 'all') {
    if (status === 'approved') {
      filter.status = 'approved';
    } else if (status === 'pending') {
      filter.status = 'pending';
    } else if (status === 'rejected') {
      filter.status = 'rejected';
    }
  }

  const vendors = await Vendor.find(filter)
    .select('-password')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Vendor.countDocuments(filter);

  res.json({
    success: true,
    data: {
      vendors,
      total
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

  const { name, email, number, businessName, address, city, state, pinCode, adminApproved } = req.body;

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
  vendor.number = number || vendor.number;
  vendor.businessName = businessName || vendor.businessName;
  vendor.address = address || vendor.address;
  vendor.city = city || vendor.city;
  vendor.state = state || vendor.state;
  vendor.pinCode = pinCode || vendor.pinCode;
  vendor.adminApproved = adminApproved !== undefined ? adminApproved : vendor.adminApproved;

  const updatedVendor = await vendor.save();

  res.json({
    success: true,
    data: {
      _id: updatedVendor._id,
      name: updatedVendor.name,
      email: updatedVendor.email,
      number: updatedVendor.number,
      businessName: updatedVendor.businessName,
      address: updatedVendor.address,
      city: updatedVendor.city,
      state: updatedVendor.state,
      pinCode: updatedVendor.pinCode,
      adminApproved: updatedVendor.adminApproved,
      status: updatedVendor.status,
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

  // Mark vendor as deleted instead of actually deleting
  await Vendor.findByIdAndUpdate(req.params.id, {
    status: 'deleted',
    adminApproved: false
  });

  res.json({
    success: true,
    message: 'Vendor deleted successfully'
  });
});


// @desc    Get vendor products (for vendor dashboard)
// @route   GET /api/vendors/products
// @access  Private (Vendor)
export const getVendorProducts = asyncHandler(async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || 'all';
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {
      vendorId,
      ...(search && { name: { $regex: search, $options: 'i' } })
    };

    // Add status filter
    if (status !== 'all') {
      switch (status) {
        case 'active':
          searchQuery.available = true;
          break;
        case 'inactive':
          searchQuery.available = false;
          break;
        case 'pending':
          searchQuery.adminApproved = { $exists: false };
          searchQuery.adminRejectionReason = { $exists: false };
          break;
        case 'approved':
          searchQuery.adminApproved = true;
          break;
        case 'rejected':
          searchQuery.adminApproved = false;
          searchQuery.adminRejectionReason = { $exists: true };
          break;
        case 'draft':
          searchQuery.available = 'draft';
          break;
      }
    }

    // Get products with basic info
    const products = await Product.find(searchQuery)
      .populate('category', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Product.countDocuments(searchQuery);

    // Transform products to include proper image handling
    const transformedProducts = products.map(product => {
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
        description: product.description,
        price: product.price,
        mrp: product.mrp,
        category: product.category?.name || product.category,
        categorySlug: product.categorySlug,
        available: product.available,
        adminApproved: product.adminApproved,
        adminRejectionReason: product.adminRejectionReason,
        images: allImages,
        primaryImage: primaryImageUrl,
        stock: product.stock,
        colors: product.colors,
        sizes: product.sizes,
        tags: product.tags,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    });

    res.json({
      success: true,
      data: transformedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


export const getVendorOrders = asyncHandler(async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get vendor's product IDs
    const vendorProducts = await Product.find({ vendorId }).distinct('_id');

    // Find orders containing vendor's products
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
  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get vendor order by ID
// @route   GET /api/vendors/orders/:id
// @access  Private (Vendor)
export const getVendorOrderById = asyncHandler(async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const orderId = req.params.id;

    // Get vendor's product IDs
    const vendorProducts = await Product.find({ vendorId }).distinct('_id');

    // Find order and ensure it contains vendor's products
    const order = await Order.findOne({
      _id: orderId,
      'orderItems.productId': { $in: vendorProducts }
    })
      .populate('orderItems.productId', 'name price images')
      .populate('user', 'name email phone');

    if (!order) {
      res.status(404);
      throw new Error('Order not found or does not belong to you');
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get vendor order by ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update vendor order
// @route   PUT /api/vendors/orders/:id
// @access  Private (Vendor)
export const updateVendorOrder = asyncHandler(async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const orderId = req.params.id;
    const updateData = req.body;

    // Get vendor's product IDs
    const vendorProducts = await Product.find({ vendorId }).distinct('_id');

    // Find order and ensure it contains vendor's products
    const order = await Order.findOne({
      _id: orderId,
      'orderItems.productId': { $in: vendorProducts }
    });

    if (!order) {
      res.status(404);
      throw new Error('Order not found or does not belong to you');
    }

    // Update allowed fields
    const allowedFields = ['status', 'shippingAddress', 'notes'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        order[field] = updateData[field];
      }
    });

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update vendor order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update order status
// @route   PUT /api/vendors/orders/:id/status
// @access  Private (Vendor)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
      res.status(400);
      throw new Error('Status is required');
    }

    // Get vendor's product IDs
    const vendorProducts = await Product.find({ vendorId }).distinct('_id');

    // Find order and ensure it contains vendor's products
    const order = await Order.findOne({
      _id: orderId,
      'orderItems.productId': { $in: vendorProducts }
    });

    if (!order) {
      res.status(404);
      throw new Error('Order not found or does not belong to you');
    }

    // Update status
    order.status = status;
    
    // Update timestamps based on status
    if (status === 'shipped') {
      order.shippedAt = new Date();
    } else if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
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
    available: true, // Only released products
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
      available: true
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

  // Validate that scheduled date is in the future (using IST)
  const scheduledDateTime = new Date(`${scheduledDate} ${scheduledTime}`);
  const now = new Date();
  
  // Convert to IST for comparison
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istNow = new Date(now.getTime() + istOffset);
  
  if (scheduledDateTime <= istNow) {
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

  // Validate that scheduled date is in the future (using IST)
  const scheduledDateTime = new Date(`${scheduledDate} ${scheduledTime}`);
  const now = new Date();
  
  // Convert to IST for comparison
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istNow = new Date(now.getTime() + istOffset);
  
  if (scheduledDateTime <= istNow) {
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
      available: true
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

// @desc    Delete a vendor's product
// @route   DELETE /api/vendors/products/:id
// @access  Private (Vendor)
export const deleteVendorProduct = asyncHandler(async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const productId = req.params.id;

    // Check if product exists and belongs to vendor
    const product = await Product.findOne({ _id: productId, vendorId });
    if (!product) {
      res.status(404);
      throw new Error('Product not found or you do not have permission to delete it');
    }

    // Delete the product
    await Product.deleteOne({ _id: productId, vendorId });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Update a vendor's product
// @route   PUT /api/vendors/products/:id
// @access  Private (Vendor)
export const updateVendorProduct = asyncHandler(async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const productId = req.params.id;
    const updateData = req.body;
    // Images are available as req.files (from multer)
    const newImageFiles = req.files || [];
    
    const product = await updateVendorProductHelper(productId, updateData, newImageFiles, vendorId);
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}); 

// @desc    Accept a vendor
// @route   POST /api/vendors/accept
// @access  Private (Admin)
export const acceptVendor = asyncHandler(async (req, res) => {
  const { vendorId, feedback } = req.body;

  if (!vendorId) {
    res.status(400);
    throw new Error('Vendor ID is required');
  }

  // Find the vendor by ID
  const vendor = await Vendor.findById(vendorId);

  if (!vendor) {
    res.status(404);
    throw new Error('Vendor not found');
  }

  // Update vendor approval status
  vendor.adminApproved = true;
  vendor.adminApprovedAt = new Date();
  vendor.adminApprovedBy = req.admin?._id;
  vendor.adminApprovalFeedback = feedback || null;
  vendor.adminRejectionReason = null;
  vendor.status = 'approved';

  await vendor.save();

  res.json({
    success: true,
    message: 'Vendor accepted successfully',
    data: {
      _id: vendor._id,
      name: vendor.name,
      email: vendor.email,
      adminApproved: vendor.adminApproved,
      status: vendor.status
    }
  });
}); 

// @desc    Reapply for vendor approval
// @route   POST /api/vendors/reapply
// @access  Private (Vendor)
export const reapplyVendor = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;
  const { 
    name, 
    businessName, 
    address, 
    city, 
    state, 
    pinCode
  } = req.body;

  const vendor = await Vendor.findById(vendorId);

  if (!vendor) {
    res.status(404);
    throw new Error('Vendor not found');
  }

  // Check if vendor is currently rejected
  if (vendor.status !== 'rejected') {
    res.status(400);
    throw new Error('Only rejected vendors can reapply');
  }

  // Update vendor information
  vendor.name = name || vendor.name;
  vendor.businessName = businessName || vendor.businessName;
  vendor.address = address || vendor.address;
  vendor.city = city || vendor.city;
  vendor.state = state || vendor.state;
  vendor.pinCode = pinCode || vendor.pinCode;
  
  // Reset status for reapplication
  vendor.status = 'pending';
  vendor.adminApproved = false;
  vendor.adminApprovedAt = null;
  vendor.adminApprovedBy = null;
  vendor.adminRejectionReason = null;
  vendor.adminApprovalFeedback = null;

  await vendor.save();

  res.json({
    success: true,
    message: 'Reapplication submitted successfully. Your application is now pending admin review.',
    data: {
      _id: vendor._id,
      name: vendor.name,
      email: vendor.email,
      status: vendor.status
    }
  });
}); 