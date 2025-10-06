import mongoose from 'mongoose';

const ColorVariantSchema = new mongoose.Schema({
    colorName: {
      type: String,
      required: true,
      trim: true,
    },
    colorCode: {
      type: String,
      required: true,
      trim: true,
      match: [/^#[0-9A-Fa-f]{6}$/, "Invalid color code format"],
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
        is_primary: { type: Boolean, default: false },
      },
    ],
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    mrp: {
      type: Number,
      min: [0, "MRP cannot be negative"],
    },
    sizes: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: { type: Boolean, default: true },
  });
const ProductSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative'],
    },
    mrp: {
        type: Number,
        required: true,
        min: [0, 'MRP cannot be negative'],
    },
    vendorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Vendor', 
        required: true 
    },
    available: { 
        type: Boolean, 
        default: true,
    },
    // Admin approval fields
    adminApproved: {
        type: Boolean,
        default: false,
    },
    adminApprovedAt: {
        type: Date,
    },
    adminApprovedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
    },

    
    adminRejectionReason: {
        type: String,
        trim: true,
        maxlength: [500, 'Rejection reason cannot exceed 500 characters']
    },

    
    // Product attributes
    sizes: [{
        type: String,
        trim: true
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    shortDescription: {
        type: String,
        trim: true,
        maxlength: [200, 'Short description cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    seoDescription: {
        type: String,
        trim: true,
        maxlength: [160, 'SEO description cannot exceed 160 characters']
    },
    seoKeyword: {
        type: String,
        trim: true,
        maxlength: [200, 'SEO keywords cannot exceed 200 characters']
    },
    seoTitle: {
        type: String,
        trim: true,
        maxlength: [60, 'SEO title cannot exceed 60 characters']
    },
    pickupLocation: {
        type: String,
        trim: true
    },
    return: {
        type: Boolean,
        default: true,
    },
    cancellation: {
        type: Boolean,
        default: true,
    },
    
    colorVariants: [ColorVariantSchema],

    
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    totalReviews: {
        type: Number,
        default: 0,
        min: [0, 'Total reviews cannot be negative']
    },
    averageRating: {
        type: Number,
        default: 0,
        min: [0, 'Average rating cannot be negative'],
        max: [5, 'Average rating cannot exceed 5']
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'draft', 'scheduled'],
        default: 'active',
    },
    keyFeatures: {
        type: [String],
        default: []
    },
    productDetails: {
        weight: { 
            type: String,
            trim: true
        },
        dimensions: { 
            type: String,
            trim: true
        },
        capacity: { 
            type: String,
            trim: true
        },
        materials: { 
            type: String,
            trim: true
        },
    },
    tags: {
        type: [String],
        default: []
    },
    
    // Pricing and offers
    offers: {
        type: Boolean,
        default: false
    },
    salePrice: {
        type: Number,
        min: [0, 'Sale price cannot be negative']
    },
    
    // Scheduling fields
    isScheduled: {
        type: Boolean,
        default: false,
    },
    scheduledPublishDate: {
        type: Date,
        default: null,
    },
    scheduledPublishTime: {
        type: String,
        default: null,
    },
    scheduleStatus: {
        type: String,
        enum: ['pending', 'published', 'cancelled'],
        default: 'pending',
    },
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
ProductSchema.index({ slug: 1 });
ProductSchema.index({ vendorId: 1 });
ProductSchema.index({ category: 1 }); // Changed from categorySlug to category
ProductSchema.index({ status: 1 });
ProductSchema.index({ adminApproved: 1 });
ProductSchema.index({ available: 1 });
ProductSchema.index({ 'colorVariants.isActive': 1 });

// Virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
    if (this.mrp && this.price && this.mrp > this.price) {
        return Math.round(((this.mrp - this.price) / this.mrp) * 100);
    }
    return 0;
});

// Virtual for category details (populated)
ProductSchema.virtual('categoryDetails', {
    ref: 'Category',
    localField: 'category',
    foreignField: '_id',
    justOne: true
});

// Virtual for vendor details (populated)
ProductSchema.virtual('vendorDetails', {
    ref: 'Vendor',
    localField: 'vendorId',
    foreignField: '_id',
    justOne: true
});

// Pre-save middleware to generate slug if not provided
ProductSchema.pre('save', function(next) {
    // Generate slug if not provided
    if (!this.slug && this.name) {
        this.slug = this.name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    
    // Generate categorySlug if not provided
    if (!this.categorySlug && this.category) {
        this.categorySlug = this.category.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    
    // Calculate discount if not set
    if (this.mrp && this.price && !this.discount) {
        this.discount = Math.round(((this.mrp - this.price) / this.mrp) * 100);
    }
    
    // Normalize sizes array
    if (!this.sizes || this.sizes.length === 0) {
        this.sizes = ['M']; // Default size
    } else {
        // Remove duplicates and normalize
        this.sizes = [...new Set(this.sizes.map(size => size.trim()))];
    }
    
    next();
});

// Method to check if product is in stock
ProductSchema.methods.isInStock = function() {
    if (this.variant && this.variantDetails && this.variantDetails.length > 0) {
        return this.variantDetails.some(variant => variant.stock > 0);
    }
    return this.stock > 0;
};

// Method to get available variants
ProductSchema.methods.getAvailableVariants = function() {
    if (this.variant && this.variantDetails) {
        return this.variantDetails.filter(variant => variant.stock > 0);
    }
    return [];
};

// Method to get available sizes
ProductSchema.methods.getAvailableSizes = function() {
    if (this.sizes && this.sizes.length > 0) {
        return this.sizes;
    }
    return ['M']; // Default size if no sizes are set
};

// Method to get available color variants
ProductSchema.methods.getAvailableColorVariants = function() {
    if (this.colorVariants && this.colorVariants.length > 0) {
        return this.colorVariants.filter(variant => variant.isActive && variant.stock > 0);
    }
    return [];
};

// Method to get color variant by name
ProductSchema.methods.getColorVariant = function(colorName) {
    if (this.colorVariants && this.colorVariants.length > 0) {
        return this.colorVariants.find(variant => 
            variant.colorName.toLowerCase() === colorName.toLowerCase() && 
            variant.isActive
        );
    }
    return null;
};

// Method to get images for a specific color
ProductSchema.methods.getColorImages = function(colorName) {
    const variant = this.getColorVariant(colorName);
    return variant ? variant.images : [];
};

// Method to check if color is in stock
ProductSchema.methods.isColorInStock = function(colorName) {
    const variant = this.getColorVariant(colorName);
    return variant ? variant.stock > 0 : false;
};

// Method to get color variant by color code
ProductSchema.methods.getColorVariantByCode = function(colorCode) {
    if (this.colorVariants && this.colorVariants.length > 0) {
        return this.colorVariants.find(variant => 
            variant.colorCode.toLowerCase() === colorCode.toLowerCase() && 
            variant.isActive
        );
    }
    return null;
};

// Method to get all available colors with basic info
ProductSchema.methods.getAvailableColors = function() {
    if (this.colorVariants && this.colorVariants.length > 0) {
        return this.colorVariants
            .filter(variant => variant.isActive && variant.stock > 0)
            .map(variant => ({
                colorName: variant.colorName,
                colorCode: variant.colorCode,
                price: variant.price || this.price,
                mrp: variant.mrp || this.mrp,
                stock: variant.stock,
                primaryImage: variant.images.find(img => img.is_primary)?.url || variant.images[0]?.url,
                sizes: variant.sizes || this.sizes
            }));
    }
    return [];
};

// Method to get color variant details for swapping
ProductSchema.methods.getColorSwapData = function(colorName) {
    const variant = this.getColorVariant(colorName);
    if (!variant) return null;
    
    return {
        colorName: variant.colorName,
        colorCode: variant.colorCode,
        price: variant.price || this.price,
        mrp: variant.mrp || this.mrp,
        stock: variant.stock,
        isInStock: variant.stock > 0,
        images: variant.images,
        sizes: variant.sizes || this.sizes,
        discountPercentage: this.calculateDiscountPercentage(variant.price || this.price, variant.mrp || this.mrp)
    };
};

// Method to calculate discount percentage for color variant
ProductSchema.methods.calculateDiscountPercentage = function(price, mrp) {
    if (mrp && price && mrp > price) {
        return Math.round(((mrp - price) / mrp) * 100);
    }
    return 0;
};

// Method to get primary color (most in stock or first available)
ProductSchema.methods.getPrimaryColor = function() {
    if (this.colorVariants && this.colorVariants.length > 0) {
        const availableColors = this.colorVariants.filter(v => v.isActive && v.stock > 0);
        if (availableColors.length === 0) return null;
        
        // Return color with highest stock or first available
        return availableColors.reduce((prev, current) => 
            (current.stock > prev.stock) ? current : prev
        );
    }
    return null;
};

// Method to check if product has multiple colors
ProductSchema.methods.hasMultipleColors = function() {
    return this.colorVariants && this.colorVariants.length > 1;
};

// Cascade delete middleware
ProductSchema.pre('deleteOne', { document: true, query: false }, async function() {
    const Review = mongoose.model('Review');
    const StockMovement = mongoose.model('StockMovement');
    const VendorSales = mongoose.model('VendorSales');
    
    // Delete related documents
    await Review.deleteMany({ proId: this._id });
    await StockMovement.deleteMany({ productId: this._id });
    await VendorSales.deleteMany({ productId: this._id });
});

const Product = mongoose.model('Product', ProductSchema);

export default Product; 