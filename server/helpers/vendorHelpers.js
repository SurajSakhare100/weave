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
        const vendor = await Vendor.findOne({ email, adminApproved: true });
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
        return Vendor.findOne({ email, adminApproved: true });
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
    
    // Note: No main images required - only color-specific images
    
    // Image validation removed - color variants handle their own images
    
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

    // Handle colorVariants - parse JSON string if needed
    if (productData.colorVariants) {
      if (typeof productData.colorVariants === 'string') {
        try {
          productData.colorVariants = JSON.parse(productData.colorVariants);
        } catch (error) {
          console.error('Error parsing colorVariants:', error);
          throw new Error('Invalid colorVariants format');
        }
      }
      
      // Ensure colorVariants is an array and validate structure
      if (Array.isArray(productData.colorVariants)) {
        productData.colorVariants = productData.colorVariants.map(variant => ({
          colorName: String(variant.colorName),
          colorCode: String(variant.colorCode),
          stock: Number(variant.stock) || 0,
          isActive: Boolean(variant.isActive !== undefined ? variant.isActive : true),
          images: variant.images || [] // Will be populated if images are uploaded
        }));
      } else {
        productData.colorVariants = [];
      }
    } else {
      productData.colorVariants = [];
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

    // Calculate total stock from color variants and set main image
    let totalStock = 0;
    let mainImages = [];
    
    if (productData.colorVariants && productData.colorVariants.length > 0) {
      totalStock = productData.colorVariants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
      
      // Set main image from first color variant's first image
      const firstVariant = productData.colorVariants[0];
      if (firstVariant && firstVariant.images && firstVariant.images.length > 0) {
        mainImages = [firstVariant.images[0]]; // Use first image as main product image
      }
    }

    const product = await Product.create({
      ...productData,
      vendorId,
      vendor: true,
      adminApproved: false, // Require admin approval
      status: 'draft', // Set initial status as draft
      stock: totalStock, // Set total stock from color variants
      images: mainImages // Set main image from first color variant
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
    if (!product) throw new Error('Product not found or unauthorized');

    const { uploadMultipleImages } = await import('../utils/imageUpload.js');

    // ========== VALIDATIONS (kept same as your version) ==========
    if (updateData.name && !updateData.name.trim()) throw new Error('Product name is required');
    if (updateData.description && !updateData.description.trim()) throw new Error('Product description is required');
    if (updateData.price && (isNaN(Number(updateData.price)) || Number(updateData.price) <= 0)) throw new Error('Valid price is required');
    if (updateData.mrp && (isNaN(Number(updateData.mrp)) || Number(updateData.mrp) <= 0)) throw new Error('Valid MRP is required');
    if (updateData.price && updateData.mrp && Number(updateData.price) > Number(updateData.mrp)) throw new Error('Price cannot be greater than MRP');
    if (updateData.category && !updateData.category) throw new Error('Category is required');

    // Generate slug/categorySlug if needed
    if (updateData.name && !updateData.slug) {
      updateData.slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (updateData.category && !updateData.categorySlug) {
      updateData.categorySlug = updateData.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Convert string → array for certain fields
    const parseList = (val, format = (x) => x.trim()) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') return val.split(',').map(format).filter(Boolean);
      return [];
    };

    updateData.tags = parseList(updateData.tags);
    updateData.sizes = parseList(updateData.sizes, (x) => x.trim().toUpperCase());
    updateData.colors = parseList(updateData.colors);

    // ========== PARSE colorVariants ==========
    if (updateData.colorVariants) {
      if (typeof updateData.colorVariants === 'string') {
        try {
          updateData.colorVariants = JSON.parse(updateData.colorVariants);
        } catch {
          throw new Error('Invalid colorVariants format');
        }
      }
      if (!Array.isArray(updateData.colorVariants)) updateData.colorVariants = [];
    }

    // ========= HANDLE EXISTING IMAGES =========
    // top-level images (legacy)
    let images = product.images ? JSON.parse(JSON.stringify(product.images)) : [];
    if (updateData.existingImages) {
      try {
        images = JSON.parse(updateData.existingImages);
      } catch {
        images = [];
      }
    }

    // ========= SEPARATE NORMAL + COLOR IMAGES =========
    const generalFiles = [];
    const colorVariantFiles = {}; // { red: [file1, file2], blue: [file1] }

    if (newImageFiles && newImageFiles.length > 0) {
      for (const file of newImageFiles) {
        if (file.fieldname && file.fieldname.startsWith('colorImages_')) {
          const colorKey = file.fieldname.replace('colorImages_', '').trim().toLowerCase();
          if (!colorVariantFiles[colorKey]) colorVariantFiles[colorKey] = [];
          colorVariantFiles[colorKey].push(file);
        } else {
          generalFiles.push(file);
        }
      }
    }

    // keep list of public_ids to delete from cloudinary
    const toDeletePublicIds = [];

    // ========= UPLOAD GENERAL IMAGES =========
    if (generalFiles.length > 0) {
      if (images.length + generalFiles.length > MAX_IMAGES) throw new Error(`Maximum ${MAX_IMAGES} images allowed`);
      const buffers = generalFiles.map((f) => f.buffer);
      const uploaded = await uploadMultipleImages(buffers, 'weave-products', `product_${product.slug}_${Date.now()}`);
      const formatted = uploaded.map((r, i) => ({
        url: r.url,
        public_id: r.public_id,
        width: r.width,
        height: r.height,
        format: r.format,
        bytes: r.bytes,
        thumbnail_url: r.eager?.[0]?.url || r.url,
        small_thumbnail_url: r.eager?.[1]?.url || r.url,
        is_primary: images.length === 0 && i === 0,
      }));
      images = [...images, ...formatted];
    }

    // ========= HANDLE COLOR VARIANT IMAGES + DELETIONS =========
    // We'll build a new colorVariants array to save (merge with incoming updateData)
    const incomingVariants = Array.isArray(updateData.colorVariants) ? updateData.colorVariants : [];
    const existingProductVariants = product.colorVariants || [];

    // Helper to get previous images for a variant (by colorName case-insensitive)
    const getPreviousVariantImages = (colorName) => {
      const prev = existingProductVariants.find(v => String(v.colorName).toLowerCase() === String(colorName).toLowerCase());
      return prev && Array.isArray(prev.images) ? prev.images.map(i => ({ ...i })) : [];
    };

    for (const variant of incomingVariants) {
      const colorKey = String(variant.colorName || '').toLowerCase();

      // 1) parse existingColorImages if provided (field name may be exact or lowercased)
      let providedExistingKeyExact = `existingColorImages_${variant.colorName}`;
      let providedExistingKeyLower = `existingColorImages_${colorKey}`;
      let providedExisting = null;

      if (updateData[providedExistingKeyExact]) {
        try { providedExisting = JSON.parse(updateData[providedExistingKeyExact]); } catch { providedExisting = null; }
      } else if (updateData[providedExistingKeyLower]) {
        try { providedExisting = JSON.parse(updateData[providedExistingKeyLower]); } catch { providedExisting = null; }
      }

      // previous images from DB for this variant
      const prevImages = getPreviousVariantImages(variant.colorName);

      // If providedExisting is present, ensure variant.images starts from that (keeps public_id/url)
      if (Array.isArray(providedExisting)) {
        // determine which prevImages were removed (present before but not in providedExisting by public_id)
        const providedPublicIds = providedExisting.map(i => i.public_id).filter(Boolean);
        const removedFromPrev = prevImages.filter(pi => pi.public_id && !providedPublicIds.includes(pi.public_id));
        removedFromPrev.forEach(r => { if (r.public_id) toDeletePublicIds.push(r.public_id); });

        // set variant.images to providedExisting (these likely contain url/public_id)
        variant.images = providedExisting.map(i => ({
          url: i.url,
          public_id: i.public_id,
          is_primary: !!i.is_primary,
          width: i.width,
          height: i.height,
          format: i.format,
        }));
      } else {
        // if not provided, start with prevImages
        variant.images = prevImages.map(i => ({ ...i }));
      }

      // 2) handle newly uploaded files for this color (if any)
      const filesForColor = colorVariantFiles[colorKey] || [];
      if (filesForColor.length > 0) {
        const buffers = filesForColor.map(f => f.buffer);
        const uploaded = await uploadMultipleImages(buffers, 'weave-products', `variant_${colorKey}_${Date.now()}`);
        const uploadedFormatted = uploaded.map(r => ({
          url: r.url,
          public_id: r.public_id,
          width: r.width,
          height: r.height,
          format: r.format,
          bytes: r.bytes,
          thumbnail_url: r.eager?.[0]?.url || r.url,
        }));
        // append uploaded images to variant.images
        variant.images = [...(variant.images || []), ...uploadedFormatted];
      }

      // ensure numeric fields
      variant.stock = Number(variant.stock) || 0;
      variant.price = typeof variant.price !== 'undefined' ? Number(variant.price) : undefined;
      variant.mrp = typeof variant.mrp !== 'undefined' ? Number(variant.mrp) : undefined;
      variant.colorCode = variant.colorCode || '#000000';
      variant.isActive = variant.isActive === undefined ? true : !!variant.isActive;
    }

    // ========= CLEANUP TOP-LEVEL IMAGES REMOVED =========
    // If updateData.existingImages provided earlier, we parsed `images` accordingly.
    // Determine which top-level images from DB are removed and schedule delete.
    const prevTopLevelPublicIds = (product.images || []).map(i => i.public_id).filter(Boolean);
    const keptTopLevelPublicIds = (images || []).map(i => i.public_id).filter(Boolean);
    const removedTopLevel = prevTopLevelPublicIds.filter(pid => !keptTopLevelPublicIds.includes(pid));
    removedTopLevel.forEach(pid => toDeletePublicIds.push(pid));

    // ========= FINAL VALIDATION - ensure at least one image via color variants or top-level images =========
    // prefer color variant images as main images
    let mainImages = [];
    if (incomingVariants.length > 0) {
      // collect first image of first variant that has images
      const firstWithImages = incomingVariants.find(v => Array.isArray(v.images) && v.images.length > 0);
      if (firstWithImages) {
        mainImages = [incomingVariants[0].images && incomingVariants[0].images[0] ? incomingVariants[0].images[0] : firstWithImages.images[0]].filter(Boolean);
      }
    }

    // fallback to top-level images if no variant images present
    if (mainImages.length === 0 && images.length > 0) {
      mainImages = [images[0]];
    }

    if (mainImages.length === 0) {
      throw new Error('At least one image is required');
    }

    // delete scheduled public_ids from cloudinary
    if (toDeletePublicIds.length > 0) {
      try {
        await deleteMultipleImages(toDeletePublicIds);
      } catch (delErr) {
        // log but do not fail the whole update for deletion failures
        console.error('Failed to delete some images from cloudinary:', delErr);
      }
    }

    // Reset admin review
    updateData.adminApproved = false;
    updateData.adminApprovedAt = null;
    updateData.adminApprovedBy = null;
    updateData.adminRejectionReason = null;
    updateData.status = 'draft';

    // attach computed images/main images and colorVariants
    let finalUpdate = { ...updateData };
    finalUpdate.images = mainImages;
    // If colorVariants present in updateData, use that as final colorVariants (already mutated above)
    if (incomingVariants.length > 0) {
      finalUpdate.colorVariants = incomingVariants;
      // compute overall stock from variants
      finalUpdate.stock = incomingVariants.reduce((s, v) => s + (Number(v.stock) || 0), 0);
    } else {
      // keep existing variants if not updating variants
      finalUpdate.colorVariants = product.colorVariants || [];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      finalUpdate,
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