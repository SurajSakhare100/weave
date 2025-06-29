import asyncHandler from 'express-async-handler';
import Vendor from '../models/Vendor.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

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