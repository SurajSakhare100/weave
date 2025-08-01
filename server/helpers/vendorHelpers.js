import mongoose from 'mongoose';
import Vendor from '../models/Vendor.js';
import Otp from '../models/Otp.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { deleteMultipleImages } from '../utils/imageUpload.js';

export default {
    addVendor: async (details) => {
        const vendor = await Vendor.findOne({ email: details.email });
        if (vendor) {
            return { found: true };
        }
        await Vendor.create(details);
        return { found: false };
    },

    checkVendorAccept: async (email) => {
        const vendor = await Vendor.findOne({ email, accept: true });
        return !!vendor;
    },
    
    checkOtp: (email, type, otpFor) => {
        return Otp.findOne({ email, type, for: otpFor });
    },

    insertOtp: (email, otp, type, otpFor) => {
        return Otp.create({ email, otp, type, for: otpFor });
    },
    
    matchOtp: async ({ email, otp }, type, otpFor) => {
        const otpEntry = await Otp.findOne({ email, otp, type, for: otpFor });
        return !!otpEntry;
    },

    getVendorAccepted: (email) => {
        return Vendor.findOne({ email, accept: true });
    },

    getVendor: (id) => {
        return Vendor.findById(id);
    },

    getOneProduct: (vendorId, proId) => {
        return Product.findOne({ _id: proId, vendorId: vendorId });
    },

    addProduct: (details) => {
        return Product.create(details);
    },

    updateProduct: (data, vendorId) => {
        const { _id, ...updateData } = data;
        return Product.updateOne({ _id, vendorId }, { $set: updateData });
    },

    getVendorProducts: (skip, limit, vendorId) => {
        return Product.find({ vendorId }).sort({ _id: -1 }).skip(skip).limit(limit).exec();
    },
    
    getProductVendorCount: (vendorId) => {
        return Product.countDocuments({ vendorId });
    },

    getProductCountVendorSearch: (search, vendorId) => {
        return Product.countDocuments({ vendorId, name: { $regex: search, $options: 'i' } });
    },

    getVendorProductsSearch: (search, skip, limit, vendorId) => {
        return Product.find({ vendorId, name: { $regex: search, $options: 'i' } })
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    },

    deleteProduct: async ({ proId, vendorId }) => {
        const result = await Product.deleteOne({ _id: proId, vendorId });
        if (result.deletedCount === 0) {
            throw new Error('Product not found or not authorized to delete.');
        }
        return result;
    },

    getAllOrders: ({ search, skip, vendorId }, limit) => {
        return Order.aggregate([
            { $unwind: '$order' },
            {
                $project: {
                    userId: '$_id',
                    date: '$order.date',
                    product: { $toString: '$order.product' },
                    secretOrderId: '$order.secretOrderId',
                    customer: '$order.details.name',
                    payStatus: '$order.payStatus',
                    payType: '$order.details.payType',
                    OrderId: '$order.OrderId',
                    OrderStatus: '$order.OrderStatus',
                    price: '$order.price',
                    vendorId: '$order.vendorId',
                }
            },
            {
                $match: {
                    vendorId: new mongoose.Types.ObjectId(vendorId),
                    customer: { $regex: search, $options: 'i' }
                }
            },
            { $sort: { OrderId: -1 } },
            { $skip: parseInt(skip) },
            { $limit: limit }
        ]);
    },

    getTotalOrders: async ({ search, vendorId }) => {
        const result = await Order.aggregate([
            { $unwind: '$order' },
            { $match: { 'order.vendorId': new mongoose.Types.ObjectId(vendorId), 'order.details.name': { $regex: search, $options: 'i' } } },
            { $count: 'count' }
        ]);
        return result.length > 0 ? result[0].count : 0;
    },

    getOrderSpecific: async ({ orderId, userId, vendorId }) => {
        const order = await Order.findOne(
            { _id: userId, 'order.secretOrderId': orderId, 'order.vendorId': vendorId },
            { 'order.$': 1 }
        ).populate('order.product');
        return order ? order.order[0] : null;
    },

    updateUserDetails: async ({ email, number, vendorId }) => {
        const ownVendor = await Vendor.findOne({ _id: vendorId, email: email });

        if (ownVendor) {
            await Vendor.updateOne({ _id: vendorId }, { $set: { number } });
            return { email: false };
        } else {
            const anotherVendor = await Vendor.findOne({ email });
            if (anotherVendor) {
                return { email: true };
            }
            await Vendor.updateOne({ _id: vendorId }, { $set: { email, number } });
            return { email: false };
        }
    },

    updateBankAccount: (details) => {
        const { vendorId, ...bankDetails } = details;
        return Vendor.findByIdAndUpdate(vendorId, { $set: bankDetails });
    },

    getDashboardTotal: async (vendorId) => {
        const id = new mongoose.Types.ObjectId(vendorId);

        const getCountByStatus = (status) => {
            return Order.aggregate([
                { $unwind: '$order' },
                { $match: { 'order.vendorId': id, 'order.OrderStatus': status } },
                { $count: 'count' }
            ]);
        };

        const totalAmountAgg = Order.aggregate([
            { $unwind: '$order' },
            { $match: { 'order.vendorId': id, 'order.OrderStatus': 'Delivered' } },
            { $group: { _id: null, amount: { $sum: '$order.price' } } }
        ]);

        const [delivered, returned, cancelled, amount] = await Promise.all([
            getCountByStatus('Delivered'),
            getCountByStatus('Return'),
            getCountByStatus('Cancelled'),
            totalAmountAgg
        ]);

        return {
            totalAmount: amount.length > 0 ? amount[0].amount : 0,
            totalDelivered: delivered.length > 0 ? delivered[0].count : 0,
            totalReturn: returned.length > 0 ? returned[0].count : 0,
            totalCancelled: cancelled.length > 0 ? cancelled[0].count : 0,
        };
    }
};

/**
 * Get vendor products with pagination and filtering
 * @param {string} vendorId - Vendor ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Products and pagination info
 */
export const getVendorProducts = async (vendorId, options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      search,
      sort = '-createdAt'
    } = options;

    const skip = (page - 1) * limit;

    // Build filter
    const filter = { vendorId };
    
    if (status) {
      filter.status = status;
    }
    
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }
    
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // Build sort
    let sortOption = {};
    switch (sort) {
      case 'name':
        sortOption = { name: 1 };
        break;
      case '-name':
        sortOption = { name: -1 };
        break;
      case 'price':
        sortOption = { price: 1 };
        break;
      case '-price':
        sortOption = { price: -1 };
        break;
      case 'createdAt':
        sortOption = { createdAt: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Product.countDocuments(filter);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting vendor products:', error);
    throw new Error('Failed to fetch vendor products');
  }
};

/**
 * Create vendor product with Cloudinary image handling
 * @param {Object} productData - Product data
 * @param {Array} imageFiles - Image files
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Object>} Created product
 */
export const createVendorProduct = async (productData, imageFiles, vendorId) => {
  try {
    const { uploadMultipleImages } = await import('../utils/imageUpload.js');
    
    // Validate required fields
    if (!productData.name || !productData.name.trim()) {
      throw new Error('Product name is required');
    }
    
    if (!productData.description || !productData.description.trim()) {
      throw new Error('Product description is required');
    }
    
    if (!productData.price || isNaN(Number(productData.price)) || Number(productData.price) <= 0) {
      throw new Error('Valid price is required (must be greater than 0)');
    }
    
    if (!productData.mrp || isNaN(Number(productData.mrp)) || Number(productData.mrp) <= 0) {
      throw new Error('Valid MRP is required (must be greater than 0)');
    }
    
    if (Number(productData.price) > Number(productData.mrp)) {
      throw new Error('Price cannot be greater than MRP');
    }
    
    if (!productData.category) {
      throw new Error('Category is required');
    }
    
    // Validate images
    if (!imageFiles || imageFiles.length === 0) {
      throw new Error('At least one image is required');
    }
    
    if (imageFiles.length > 4) {
      throw new Error('Maximum 4 images allowed');
    }
    
    // Validate image files
    for (const file of imageFiles) {
      if (!file.mimetype.startsWith('image/')) {
        throw new Error('All files must be images');
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Each image must be less than 5MB');
      }
    }
    
    // Generate slug if not provided
    if (!productData.slug && productData.name) {
      productData.slug = productData.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    // Generate categorySlug if not provided
    if (!productData.categorySlug && productData.category) {
      productData.categorySlug = productData.category.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    // Handle tags - ensure it's an array
    if (productData.tags) {
      if (typeof productData.tags === 'string') {
        // If tags is a string, split by comma and clean up
        productData.tags = productData.tags.split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
      } else if (!Array.isArray(productData.tags)) {
        productData.tags = [];
      }
    } else {
      productData.tags = [];
    }
    
    // Handle sizes - ensure it's an array
    if (productData.sizes) {
      if (typeof productData.sizes === 'string') {
        // If sizes is a string, split by comma and clean up
        productData.sizes = productData.sizes.split(',')
          .map(size => size.trim().toUpperCase())
          .filter(size => size.length > 0);
      } else if (!Array.isArray(productData.sizes)) {
        productData.sizes = ['M']; // Default size
      }
    } else {
      productData.sizes = ['M']; // Default size
    }
    
    // Validate sizes
    if (productData.sizes.length === 0) {
      throw new Error('At least one size must be selected');
    }
    
    // Handle colors - ensure it's an array
    if (productData.colors) {
      if (typeof productData.colors === 'string') {
        productData.colors = productData.colors.split(',')
          .map(color => color.trim())
          .filter(color => color.length > 0);
      } else if (!Array.isArray(productData.colors)) {
        productData.colors = [];
      }
    } else {
      productData.colors = [];
    }
    
    // Handle key features - ensure it's an array
    if (productData.keyFeatures) {
      if (!Array.isArray(productData.keyFeatures)) {
        productData.keyFeatures = [];
      }
      // Filter out empty features
      productData.keyFeatures = productData.keyFeatures.filter(feature => feature && feature.trim());
    } else {
      productData.keyFeatures = [];
    }
    
    // Handle product details
    if (productData.productDetails) {
      if (typeof productData.productDetails === 'string') {
        try {
          productData.productDetails = JSON.parse(productData.productDetails);
        } catch (e) {
          productData.productDetails = {};
        }
      }
    } else {
      productData.productDetails = {};
    }
    
    // Handle offers and sale price validation
    if (productData.offers === 'true' || productData.offers === true) {
      if (!productData.salePrice || isNaN(Number(productData.salePrice)) || Number(productData.salePrice) <= 0) {
        throw new Error('Valid sale price is required when offers is enabled');
      }
      if (Number(productData.salePrice) >= Number(productData.price)) {
        throw new Error('Sale price must be less than regular price');
      }
    }
    
    // Handle image uploads
    let images = [];
    if (imageFiles && imageFiles.length > 0) {
      const imageBuffers = imageFiles.map(file => file.buffer);
      const uploadResults = await uploadMultipleImages(
        imageBuffers,
        'weave-products',
        `product_${productData.slug || 'temp'}_${Date.now()}`
      );

      images = uploadResults.map((result, index) => ({
        url: result.url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        thumbnail_url: result.eager && result.eager[0] ? result.eager[0].url : result.url,
        small_thumbnail_url: result.eager && result.eager[1] ? result.eager[1].url : result.url,
        is_primary: index === 0
      }));
    }

    const product = await Product.create({
      ...productData,
      vendorId,
      vendor: true,
      adminApproved: false, // Require admin approval
      status: 'draft', // Set initial status as draft
      images
    });

    return product;
  } catch (error) {
    console.error('Error creating vendor product:', error);
    throw new Error(error.message || 'Failed to create product');
  }
};

/**
 * Update vendor product with Cloudinary image handling
 * @param {string} productId - Product ID
 * @param {Object} updateData - Update data
 * @param {Array} newImageFiles - New image files
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Object>} Updated product
 */
export const updateVendorProduct = async (productId, updateData, newImageFiles, vendorId) => {
  try {
    const product = await Product.findOne({ _id: productId, vendorId });
    
    if (!product) {
      throw new Error('Product not found or unauthorized');
    }

    const { uploadMultipleImages } = await import('../utils/imageUpload.js');
    
    // Validate required fields if they're being updated
    if (updateData.name && (!updateData.name.trim())) {
      throw new Error('Product name is required');
    }
    
    if (updateData.description && (!updateData.description.trim())) {
      throw new Error('Product description is required');
    }
    
    if (updateData.price && (isNaN(Number(updateData.price)) || Number(updateData.price) <= 0)) {
      throw new Error('Valid price is required (must be greater than 0)');
    }
    
    if (updateData.mrp && (isNaN(Number(updateData.mrp)) || Number(updateData.mrp) <= 0)) {
      throw new Error('Valid MRP is required (must be greater than 0)');
    }
    
    if (updateData.price && updateData.mrp && Number(updateData.price) > Number(updateData.mrp)) {
      throw new Error('Price cannot be greater than MRP');
    }
    
    if (updateData.category && !updateData.category) {
      throw new Error('Category is required');
    }
    
    // Generate slug if name is being updated and slug is not provided
    if (updateData.name && !updateData.slug) {
      updateData.slug = updateData.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    // Generate categorySlug if category is being updated and categorySlug is not provided
    if (updateData.category && !updateData.categorySlug) {
      updateData.categorySlug = updateData.category.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    // Handle tags - ensure it's an array
    if (updateData.tags) {
      if (typeof updateData.tags === 'string') {
        // If tags is a string, split by comma and clean up
        updateData.tags = updateData.tags.split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
      } else if (!Array.isArray(updateData.tags)) {
        updateData.tags = [];
      }
    }
    
    // Handle sizes - ensure it's an array
    if (updateData.sizes) {
      if (typeof updateData.sizes === 'string') {
        // If sizes is a string, split by comma and clean up
        updateData.sizes = updateData.sizes.split(',')
          .map(size => size.trim().toUpperCase())
          .filter(size => size.length > 0);
      } else if (!Array.isArray(updateData.sizes)) {
        updateData.sizes = ['M']; // Default size
      }
      
      // Validate sizes
      if (updateData.sizes.length === 0) {
        throw new Error('At least one size must be selected');
      }
    }
    
    // Handle colors - ensure it's an array
    if (updateData.colors) {
      if (typeof updateData.colors === 'string') {
        updateData.colors = updateData.colors.split(',')
          .map(color => color.trim())
          .filter(color => color.length > 0);
      } else if (!Array.isArray(updateData.colors)) {
        updateData.colors = [];
      }
    }
    
    // Handle key features - ensure it's an array
    if (updateData.keyFeatures) {
      if (!Array.isArray(updateData.keyFeatures)) {
        updateData.keyFeatures = [];
      }
      // Filter out empty features
      updateData.keyFeatures = updateData.keyFeatures.filter(feature => feature && feature.trim());
    }
    
    // Handle product details
    if (updateData.productDetails) {
      if (typeof updateData.productDetails === 'string') {
        try {
          updateData.productDetails = JSON.parse(updateData.productDetails);
        } catch (e) {
          updateData.productDetails = {};
        }
      }
    }
    
    // Handle offers and sale price validation
    if (updateData.offers === 'true' || updateData.offers === true) {
      if (!updateData.salePrice || isNaN(Number(updateData.salePrice)) || Number(updateData.salePrice) <= 0) {
        throw new Error('Valid sale price is required when offers is enabled');
      }
      if (Number(updateData.salePrice) >= Number(updateData.price || product.price)) {
        throw new Error('Sale price must be less than regular price');
      }
    }
    
    // Handle existing images
    let images = product.images || [];
    
    if (updateData.existingImages) {
      try {
        const existingImages = JSON.parse(updateData.existingImages);
        images = existingImages;
      } catch (error) {
        console.error('Error parsing existingImages:', error);
        images = [];
      }
    }

    // Validate new image files
    if (newImageFiles && newImageFiles.length > 0) {
      // Check total image count (existing + new)
      if (images.length + newImageFiles.length > 4) {
        throw new Error('Maximum 4 images allowed');
      }
      
      // Validate each new image file
      for (const file of newImageFiles) {
        if (!file.mimetype.startsWith('image/')) {
          throw new Error('All files must be images');
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('Each image must be less than 5MB');
        }
      }
      
      const imageBuffers = newImageFiles.map(file => file.buffer);
      const uploadResults = await uploadMultipleImages(
        imageBuffers,
        'weave-products',
        `product_${product.slug}_${Date.now()}`
      );

      const newImages = uploadResults.map((result, index) => ({
        url: result.url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        thumbnail_url: result.eager && result.eager[0] ? result.eager[0].url : result.url,
        small_thumbnail_url: result.eager && result.eager[1] ? result.eager[1].url : result.url,
        is_primary: images.length === 0 && index === 0
      }));

      images = [...images, ...newImages];
    }
    
    // Ensure at least one image remains
    if (images.length === 0) {
      throw new Error('At least one image is required');
    }

    // Reset admin approval status when product is updated
    updateData.adminApproved = false;
    updateData.adminApprovedAt = null;
    updateData.adminApprovedBy = null;
    updateData.adminRejectionReason = null;
    updateData.status = 'draft'; // Set back to draft for admin review

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { ...updateData, images },
      { new: true, runValidators: true }
    );

    return updatedProduct;
  } catch (error) {
    console.error('Error updating vendor product:', error);
    throw new Error(error.message || 'Failed to update product');
  }
};

/**
 * Delete vendor product and associated Cloudinary images
 * @param {string} productId - Product ID
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteVendorProduct = async (productId, vendorId) => {
  try {
    const product = await Product.findOne({ _id: productId, vendorId });
    
    if (!product) {
      throw new Error('Product not found or unauthorized');
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const publicIds = product.images.map(img => img.public_id).filter(Boolean);
      if (publicIds.length > 0) {
        await deleteMultipleImages(publicIds);
      }
    }

    await Product.findByIdAndDelete(productId);
    return true;
  } catch (error) {
    console.error('Error deleting vendor product:', error);
    throw new Error('Failed to delete product');
  }
};

/**
 * Get vendor product statistics
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Object>} Statistics
 */
export const getVendorProductStats = async (vendorId) => {
  try {
    const totalProducts = await Product.countDocuments({ vendorId });
    const activeProducts = await Product.countDocuments({ vendorId, status: 'active' });
    const inactiveProducts = await Product.countDocuments({ vendorId, status: 'inactive' });
    const draftProducts = await Product.countDocuments({ vendorId, status: 'draft' });
    
    const lowStockProducts = await Product.countDocuments({
      vendorId,
      stock: { $lt: 10 },
      status: 'active'
    });

    const outOfStockProducts = await Product.countDocuments({
      vendorId,
      stock: 0,
      status: 'active'
    });

    return {
      total: totalProducts,
      active: activeProducts,
      inactive: inactiveProducts,
      draft: draftProducts,
      lowStock: lowStockProducts,
      outOfStock: outOfStockProducts
    };
  } catch (error) {
    console.error('Error getting vendor product stats:', error);
    throw new Error('Failed to fetch product statistics');
  }
};

/**
 * Bulk update product status
 * @param {Array<string>} productIds - Array of product IDs
 * @param {string} status - New status
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Object>} Update result
 */
export const bulkUpdateProductStatus = async (productIds, status, vendorId) => {
  try {
    const result = await Product.updateMany(
      { _id: { $in: productIds }, vendorId },
      { status }
    );

    return {
      success: true,
      modifiedCount: result.modifiedCount,
      message: `Updated ${result.modifiedCount} products to ${status} status`
    };
  } catch (error) {
    console.error('Error bulk updating product status:', error);
    throw new Error('Failed to update product status');
  }
};

/**
 * Search vendor products
 * @param {string} vendorId - Vendor ID
 * @param {string} searchTerm - Search term
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Search results
 */
export const searchVendorProducts = async (vendorId, searchTerm, options = {}) => {
  try {
    const { limit = 20, status } = options;

    const filter = {
      vendorId,
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    if (status) {
      filter.status = status;
    }

    const products = await Product.find(filter)
      .limit(limit)
      .select('name price mrp images status stock')
      .sort({ createdAt: -1 });

    return products;
  } catch (error) {
    console.error('Error searching vendor products:', error);
    throw new Error('Failed to search products');
  }
}; 