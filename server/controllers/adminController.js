import asyncHandler from 'express-async-handler';
import adminHelpers from '../helpers/adminHelpers.js';
import { sendTemplateEmail, sendVendorRejectionEmail, sendVendorApprovalEmail } from '../utils/emailService.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Coupon from '../models/Coupon.js';
import Vendor from '../models/Vendor.js';

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
    // Get basic stats for admin dashboard
    const stats = {
      totalOrders: 0,
      totalRevenue: 0,
      totalVendors: 0,
      totalProducts: 0,
      pendingVendors: 0,
      pendingProducts: 0
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500);
    throw new Error('Failed to get dashboard stats');
  }
}); 

// Get all products for admin with filtering
export const getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, search = '', approvalStatus = 'pending' } = req.query; // Default to pending
  const limit = 12;
  const skip = (page - 1) * limit;
  
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
    .limit(limit);
    
  const total = await Product.countDocuments(query);
  const totalPages = Math.ceil(total / limit);
  
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