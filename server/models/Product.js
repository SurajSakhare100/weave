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
    vendor: {
        type: Boolean,
        default: false,
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
        type: String,
        required: true,
        trim: true
    },
    categorySlug: {
        type: String,
        required: true,
        trim: true
    },
    srtDescription: {
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
    pickup_location: {
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
ProductSchema.index({ categorySlug: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ adminApproved: 1 });

// Virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
    if (this.mrp && this.price && this.mrp > this.price) {
        return Math.round(((this.mrp - this.price) / this.mrp) * 100);
    }
    return 0;
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

const Product = mongoose.model('Product', ProductSchema);

export default Product; 