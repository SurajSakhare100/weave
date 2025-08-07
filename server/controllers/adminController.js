import asyncHandler from 'express-async-handler';
import adminHelpers from '../helpers/adminHelpers.js';
import { sendTemplateEmail, sendVendorRejectionEmail, sendVendorApprovalEmail } from '../utils/emailService.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Coupon from '../models/Coupon.js';
import Vendor from '../models/Vendor.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import mongoose from 'mongoose';

// Get pending vendors for approval
export const getPendingVendors = asyncHandler(async (req, res) => {
  const { skip = 0, limit = 10 } = req.query;
  
  const vendors = await adminHelpers.getPendingVendors(skip, limit);
  const total = await adminHelpers.getPendingVendorsCount();
  
  res.json({
    success: true,
    data: {
      vendors,
      total
    },
    skip: parseInt(skip),
    limit: parseInt(limit)
  });
});

// Approve vendor
export const approveVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { feedback } = req.body; // Add feedback from request body
  const adminId = req.admin._id;
  
  const vendor = await adminHelpers.approveVendor(vendorId, adminId, feedback);
  
  // Send approval email to vendor
  try {
    await sendVendorApprovalEmail(vendor, feedback);
  } catch (error) {
    console.error('Failed to send vendor approval email:', error);
  }
  
  res.json({
    success: true,
    message: 'Vendor approved successfully',
    vendor
  });
});

// Reject vendor
export const rejectVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { rejectionReason } = req.body;
  const adminId = req.admin._id;
  
  if (!rejectionReason) {
    res.status(400);
    throw new Error('Rejection reason is required');
  }
  
  const vendor = await adminHelpers.rejectVendor(vendorId, adminId, rejectionReason);
  
  // Send rejection email to vendor
  try {
    await sendVendorRejectionEmail(vendor, rejectionReason);
  } catch (error) {
    console.error('Failed to send vendor rejection email:', error);
  }
  
  res.json({
    success: true,
    message: 'Vendor rejected successfully',
    vendor
  });
});

// Get pending products for approval
export const getPendingProducts = asyncHandler(async (req, res) => {
  const { skip = 0, limit = 10 } = req.query;
  
  const products = await adminHelpers.getPendingProducts(skip, limit);
  const total = await adminHelpers.getPendingProductsCount();
  
  res.json({
    success: true,
    products,
    total,
    skip: parseInt(skip),
    limit: parseInt(limit)
  });
});

// Approve product
export const approveProduct = asyncHandler(async (req, res) => {
  const { productId, feedback } = req.body;
  const adminId = req.admin._id;
  
  if (!productId) {
    res.status(400);
    throw new Error('Product ID is required');
  }
  
  const product = await adminHelpers.approveProduct(productId, adminId, feedback);
  
  // Send approval email to vendor
  try {
    await sendTemplateEmail('productApproval', {
      vendorName: product.vendorId.name,
      productName: product.name,
      category: product.category,
      price: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(product.price),
      feedback: feedback || 'No additional feedback provided.',
      dashboardUrl: `${process.env.FRONTEND_URL}/vendor/products/${product._id}`
    }, product.vendorId.email);
  } catch (error) {
    console.error('Failed to send product approval email:', error);
  }
  
  res.json({
    success: true,
    message: 'Product approved successfully',
    product
  });
});

// Reject product
export const rejectProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rejectionReason } = req.body;
  const adminId = req.admin._id;
  
  if (!rejectionReason) {
    res.status(400);
    throw new Error('Rejection reason is required');
  }
  
  const product = await adminHelpers.rejectProduct(productId, adminId, rejectionReason);
  
  // Send rejection email to vendor
  try {
    await sendTemplateEmail('productRejection', {
      vendorName: product.vendorId.name,
      productName: product.name,
      rejectionReason,
      dashboardUrl: `${process.env.FRONTEND_URL}/vendor/products/${product._id}/edit`
    }, product.vendorId.email);
  } catch (error) {
    console.error('Failed to send product rejection email:', error);
  }
  
  res.json({
    success: true,
    message: 'Product rejected successfully',
    product
  });
});

// Get approval statistics for dashboard
export const getApprovalStats = asyncHandler(async (req, res) => {
  const stats = await adminHelpers.getApprovalStats();
  
  res.json({
    success: true,
    stats
  });
});

// Get dashboard stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Get time periods
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get order statistics
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          returnedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] }
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get recent orders (last 30 days)
    const recentOrderStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          recentOrders: { $sum: 1 },
          recentRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Get vendor statistics
    const vendorStats = await Vendor.aggregate([
      {
        $group: {
          _id: null,
          totalVendors: { $sum: 1 },
          approvedVendors: {
            $sum: { $cond: [{ $eq: ['$adminApproved', true] }, 1, 0] }
          },
          pendingVendors: {
            $sum: { $cond: [{ $ne: ['$adminApproved', true] }, 1, 0] }
          }
        }
      }
    ]);

    // Get product statistics
    const productStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          approvedProducts: {
            $sum: { $cond: [{ $eq: ['$adminApproved', true] }, 1, 0] }
          },
          pendingProducts: {
            $sum: { $cond: [{ $ne: ['$adminApproved', true] }, 1, 0] }
          }
        }
      }
    ]);

    // Get recent orders for display
    const recentOrders = await Order.find()
      .populate('user', 'firstName lastName email')
      .populate({
        path: 'orderItems.productId',
        populate: {
          path: 'vendorId',
          select: 'businessName name'
        }
      })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get daily revenue for the last 7 days
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get top performing products
    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.productId',
          totalSold: { $sum: '$orderItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          totalSold: 1,
          totalRevenue: 1,
          image: { $arrayElemAt: ['$product.images.url', 0] }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // Format the response
    const stats = {
      // Order stats
      totalOrders: orderStats[0]?.totalOrders || 0,
      totalRevenue: orderStats[0]?.totalRevenue || 0,
      deliveredOrders: orderStats[0]?.deliveredOrders || 0,
      cancelledOrders: orderStats[0]?.cancelledOrders || 0,
      returnedOrders: orderStats[0]?.returnedOrders || 0,
      pendingOrders: orderStats[0]?.pendingOrders || 0,
      processingOrders: orderStats[0]?.processingOrders || 0,
      shippedOrders: orderStats[0]?.shippedOrders || 0,
      
      // Recent stats
      recentOrders: recentOrderStats[0]?.recentOrders || 0,
      recentRevenue: recentOrderStats[0]?.recentRevenue || 0,
      
      // Vendor stats
      totalVendors: vendorStats[0]?.totalVendors || 0,
      approvedVendors: vendorStats[0]?.approvedVendors || 0,
      pendingVendors: vendorStats[0]?.pendingVendors || 0,
      
      // Product stats
      totalProducts: productStats[0]?.totalProducts || 0,
      approvedProducts: productStats[0]?.approvedProducts || 0,
      pendingProducts: productStats[0]?.pendingProducts || 0,
      
      // Additional data
      recentOrdersList: recentOrders.map(order => ({
        _id: order._id,
        secretOrderId: order._id.toString(),
        customer: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || order.user?.email || 'N/A',
        totalPrice: order.totalPrice,
        status: order.status,
        paymentMethod: order.paymentMethod,
        isPaid: order.isPaid,
        createdAt: order.createdAt,
        itemCount: order.orderItems.length,
        vendorName: order.orderItems[0]?.productId?.vendorId?.businessName || order.orderItems[0]?.productId?.vendorId?.name || 'N/A'
      })),
      dailyRevenue,
      topProducts
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard stats',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}); 

// @desc    Get product statistics (Admin)
// @route   GET /api/admin/products/stats
// @access  Private/Admin
export const getAdminProductStats = asyncHandler(async (req, res) => {
  try {
    // Get approval status counts
    const approvalCounts = await Product.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$adminApproved', true] },
              'approved',
              {
                $cond: [
                  { $and: [{ $eq: ['$adminApproved', false] }, { $ne: ['$adminRejectionReason', null] }] },
                  'rejected',
                  'pending'
                ]
              }
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get vendor counts
    const vendorCounts = await Product.aggregate([
      {
        $lookup: {
          from: 'vendors',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendor'
        }
      },
      {
        $unwind: '$vendor'
      },
      {
        $group: {
          _id: '$vendor.businessName',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get category counts
    const categoryCounts = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: '$categoryInfo'
      },
      {
        $group: {
          _id: '$categoryInfo.name',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total products
    const totalProducts = await Product.countDocuments();

    // Get recent products (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentProducts = await Product.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Format approval counts
    const formattedApprovalCounts = {
      all: totalProducts,
      pending: 0,
      approved: 0,
      rejected: 0
    };

    approvalCounts.forEach(item => {
      if (item._id && formattedApprovalCounts.hasOwnProperty(item._id)) {
        formattedApprovalCounts[item._id] = item.count;
      }
    });

    // Format vendor counts
    const formattedVendorCounts = {};
    vendorCounts.forEach(item => {
      if (item._id) {
        formattedVendorCounts[item._id] = item.count;
      }
    });

    // Format category counts
    const formattedCategoryCounts = {};
    categoryCounts.forEach(item => {
      if (item._id) {
        formattedCategoryCounts[item._id] = item.count;
      }
    });

    res.json({
      success: true,
      data: {
        approvalCounts: formattedApprovalCounts,
        vendorCounts: formattedVendorCounts,
        categoryCounts: formattedCategoryCounts,
        totalProducts,
        recentProducts
      }
    });
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch product statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get all products for admin with filtering
export const getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, search = '', approvalStatus = 'all', limit = 10 } = req.query; // Default to all
  const limitNum = parseInt(limit);
  const skip = (page - 1) * limitNum;
  
  // Build query based on filters
  let query = {};
  
  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }
  
  // Approval status filter - Default to pending products only
  if (approvalStatus === 'pending') {
    // Show products that are not yet approved (pending admin review)
    query.adminApproved = { $exists: false };
    query.adminRejectionReason = { $exists: false };
  } else if (approvalStatus === 'approved') {
    query.adminApproved = true;
  } else if (approvalStatus === 'rejected') {
    query.adminApproved = false;
    query.adminRejectionReason = { $exists: true, $ne: null };
  } else if (approvalStatus === 'all') {
    // Show all products including pending, approved, and rejected
    // No additional filter needed
  }
  
  const products = await Product.find(query)
    .populate('vendorId', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);
    
  const total = await Product.countDocuments(query);
  const totalPages = Math.ceil(total / limitNum);
  
  res.json({
    success: true,
    data: products,
    total,
    currentPage: parseInt(page),
    totalPages,
    pagination: totalPages > 1,
    showNot: products.length === 0
  });
}); 

// Category Management Controllers

// Get all categories with types
export const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: {
        categories: categories
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500);
    throw new Error('Failed to fetch categories');
  }
});

// Create new category
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, slug, image, parentId } = req.body;
  
  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }
  
  // Generate slug if not provided
  const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const categoryData = {
    name,
    description,
    slug: categorySlug,
    image,
    parentId: parentId || null
  };
  
  const category = await Category.create(categoryData);
  
  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category
  });
});

// Update category
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  const category = await Category.findByIdAndUpdate(id, updateData, { new: true });
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  res.json({
    success: true,
    message: 'Category updated successfully',
    data: category
  });
});

// Delete category
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { folderId } = req.body;
  
  const category = await Category.findByIdAndDelete(id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  // TODO: Handle folder deletion if needed
  
  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// Get single category
export const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const category = await Category.findById(id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  res.json({
    success: true,
    data: category
  });
});



// Add header category (legacy endpoint)
export const addHeaderCategory = asyncHandler(async (req, res) => {
  const { name, description, slug, image } = req.body;
  
  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }
  
  const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const category = await Category.create({
    name,
    description,
    slug: categorySlug,
    image,
    type: 'header'
  });
  
  res.json({
    success: true,
    message: 'Header category added successfully',
    data: category
  });
});



// ==================== COUPON MANAGEMENT ====================

// Get all coupons
export const getAllCoupons = asyncHandler(async (req, res) => {
  const { skip = 0, limit = 10, search = '', status = 'all' } = req.query;
  
  let query = {};
  
  if (search) {
    query.$or = [
      { code: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (status === 'active') {
    query.isActive = true;
  } else if (status === 'inactive') {
    query.isActive = false;
  }
  
  const coupons = await Coupon.find(query)
    .sort({ createdAt: -1 })
    .skip(parseInt(skip))
    .limit(parseInt(limit));
    
  const total = await Coupon.countDocuments(query);
  
  res.json({
    success: true,
    data: {
      coupons,
      total,
      skip: parseInt(skip),
      limit: parseInt(limit)
    }
  });
});

// Get coupon by ID
export const getCouponById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const coupon = await Coupon.findById(id);
  
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  
  res.json({
    success: true,
    data: coupon
  });
});

// Create coupon
export const createCoupon = asyncHandler(async (req, res) => {
  const { code, discount, min, max, validFrom, validTo, isActive, usageLimit } = req.body;
  
  if (!code || !discount || !min || !max) {
    res.status(400);
    throw new Error('Code, discount, min, and max are required');
  }
  
  // Check if coupon code already exists
  const existingCoupon = await Coupon.findOne({ code });
  if (existingCoupon) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }
  
  const coupon = await Coupon.create({
    code,
    discount: parseFloat(discount),
    min: parseFloat(min),
    max: parseFloat(max),
    validFrom: validFrom ? new Date(validFrom) : new Date(),
    validTo: validTo ? new Date(validTo) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
    isActive: isActive !== undefined ? isActive : true,
    usageLimit: usageLimit ? parseInt(usageLimit) : -1
  });
  
  res.status(201).json({
    success: true,
    message: 'Coupon created successfully',
    data: coupon
  });
});

// Update coupon
export const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  const coupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true });
  
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  
  res.json({
    success: true,
    message: 'Coupon updated successfully',
    data: coupon
  });
});

// Delete coupon
export const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const coupon = await Coupon.findByIdAndDelete(id);
  
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  
  res.json({
    success: true,
    message: 'Coupon deleted successfully'
  });
});

// ==================== LAYOUT MANAGEMENT ====================

// Get all layouts
export const getLayouts = asyncHandler(async (req, res) => {
  // This is a placeholder - you'll need to create a Layout model
  // For now, returning empty array
  res.json({
    success: true,
    data: {
      layouts: []
    }
  });
});

// Update layout
export const updateLayout = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const layoutData = req.body;
  
  // This is a placeholder - you'll need to create a Layout model
  // For now, returning success
  res.json({
    success: true,
    message: 'Layout updated successfully',
    data: { id, ...layoutData }
  });
});

// ==================== VENDOR STATS ====================

// Get vendor statistics
export const getVendorStats = asyncHandler(async (req, res) => {
  try {
    const totalVendors = await Vendor.countDocuments();
    const activeVendors = await Vendor.countDocuments({ adminApproved: true });
    const pendingVendors = await Vendor.countDocuments({ adminApproved: { $ne: true } });
    const suspendedVendors = await Vendor.countDocuments({ isSuspended: true });
    
    res.json({
      success: true,
      data: {
        totalVendors,
        activeVendors,
        pendingVendors,
        suspendedVendors
      }
    });
  } catch (error) {
    console.error('Error getting vendor stats:', error);
    res.status(500);
    throw new Error('Failed to get vendor stats');
  }
}); 


// ==================== CUSTOMER MANAGEMENT ====================

// Get all customers
export const getCustomers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', sort = 'createdAt', order = 'desc' } = req.query;
  const limitNum = parseInt(limit);
  const skip = (page - 1) * limitNum;

  let query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const customers = await User.find(query)
    .sort({ [sort]: order === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limitNum)
    .select('firstName lastName email number address city state zip country createdAt');
  

  const total = await User.countDocuments(query);
  
  res.json({
    success: true,
    data: {
      customers,
      total,
      page,
      limit
    }
  });
}); 

// Get customer by ID

export const getCustomerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customer = await User.findById(id);
  res.json({
    success: true,
    data: customer
  });
}); 

// Delete customer
export const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  res.json({
    success: true,
    message: 'Customer deleted successfully'
  });
}); 

// Update customer
export const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const customer = await User.findByIdAndUpdate(id, updateData, { new: true });
  res.json({
    success: true,
    message: 'Customer updated successfully',
    data: customer
  });
}); 

// Get customer orders
export const getCustomerOrders = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orders = await Order.find({ user: id }).populate('orderItems.productId').populate('user', 'firstName lastName email number');
  const total = await Order.countDocuments({ user: id });

  res.json({
    success: true,
    data: {
      orders: orders || [],
      total: total || 0
    }
  });
}); 

// Get customer orders
export const getCustomerOrdersById = asyncHandler(async (req, res) => {
  const {orderId } = req.params;
  const id=orderId;
 

  const orders = await Order.findById(id)
  const total = await Order.countDocuments({ user: id });
  
  await orders.populate('orderItems.productId');
  await orders.populate('user', 'firstName lastName email number');
  

  res.json({
    success: true,
    data: {
      orders: orders || [],
      total: total || 0
    }
  });
}); 