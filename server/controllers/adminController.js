import asyncHandler from 'express-async-handler';
import adminHelpers from '../helpers/adminHelpers.js';
import { sendTemplateEmail } from '../utils/emailService.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

// Get pending vendors for approval
export const getPendingVendors = asyncHandler(async (req, res) => {
  const { skip = 0, limit = 10 } = req.query;
  
  const vendors = await adminHelpers.getPendingVendors(skip, limit);
  const total = await adminHelpers.getPendingVendorsCount();
  
  res.json({
    success: true,
    vendors,
    total,
    skip: parseInt(skip),
    limit: parseInt(limit)
  });
});

// Approve vendor
export const approveVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const adminId = req.admin._id;
  
  const vendor = await adminHelpers.approveVendor(vendorId, adminId);
  
  // Send approval email to vendor
  try {
    await sendTemplateEmail('vendorApproval', {
      contactName: vendor.name,
      businessName: vendor.businessName || vendor.name,
      dashboardUrl: `${process.env.FRONTEND_URL}/vendor/dashboard`
    }, vendor.email);
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
    await sendTemplateEmail('vendorRejection', {
      contactName: vendor.name,
      businessName: vendor.businessName || vendor.name,
      rejectionReason
    }, vendor.email);
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
  const { productId } = req.params;
  const adminId = req.admin._id;
  
  const product = await adminHelpers.approveProduct(productId, adminId);
  
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
  const { page = 1, search = '', approvalStatus = 'all' } = req.query;
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
  
  // Approval status filter
  if (approvalStatus === 'pending') {
    query.adminApproved = { $ne: true };
  } else if (approvalStatus === 'approved') {
    query.adminApproved = true;
  } else if (approvalStatus === 'rejected') {
    query.adminApproved = false;
    query.adminRejectionReason = { $exists: true, $ne: null };
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
    
    // Group categories by type
    const mainCategories = categories.filter(cat => !cat.parentId);
    const mainSubCategories = categories.filter(cat => cat.parentId && !cat.mainSubId);
    const subCategories = categories.filter(cat => cat.mainSubId);
    
    res.json({
      success: true,
      data: {
        categories: mainCategories,
        mainSub: mainSubCategories,
        subCategory: subCategories
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
  const { name, description, slug, image, parentId, mainSubId } = req.body;
  
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
    parentId: parentId || null,
    mainSubId: mainSubId || null
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

// Delete main sub category
export const deleteMainSubCategory = asyncHandler(async (req, res) => {
  const { id, uni_id } = req.params;
  
  const category = await Category.findByIdAndDelete(id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  res.json({
    success: true,
    message: 'Main sub category deleted successfully'
  });
});

// Delete sub category
export const deleteSubCategory = asyncHandler(async (req, res) => {
  const { id, uni_id } = req.params;
  
  const category = await Category.findByIdAndDelete(id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  res.json({
    success: true,
    message: 'Sub category deleted successfully'
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

// Add main sub category (legacy endpoint)
export const addMainSubCategory = asyncHandler(async (req, res) => {
  const { name, description, slug, image, category } = req.body;
  
  if (!name || !category) {
    res.status(400);
    throw new Error('Name and category are required');
  }
  
  const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const mainSubCategory = await Category.create({
    name,
    description,
    slug: categorySlug,
    image,
    parentId: category,
    type: 'mainSub'
  });
  
  res.json({
    success: true,
    message: 'Main sub category added successfully',
    data: mainSubCategory
  });
});

// Add sub category (legacy endpoint)
export const addSubCategory = asyncHandler(async (req, res) => {
  const { name, description, slug, image, mainSub, category } = req.body;
  
  if (!name || !mainSub || !category) {
    res.status(400);
    throw new Error('Name, main sub, and category are required');
  }
  
  const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const subCategory = await Category.create({
    name,
    description,
    slug: categorySlug,
    image,
    parentId: category,
    mainSubId: mainSub,
    type: 'sub'
  });
  
  res.json({
    success: true,
    message: 'Sub category added successfully',
    data: subCategory
  });
}); 