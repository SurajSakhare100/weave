import mongoose from "mongoose";

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
  stock: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, required: true, min: 0 },
  sizes: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true },
});

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, unique: true, lowercase: true, trim: true },

    // Base pricing (for default color or listing)
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    available: { type: Boolean, default: true },

    // Admin approval
    adminApproved: { type: Boolean, default: false },
    adminApprovedAt: { type: Date },
    adminApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    adminRejectionReason: { type: String, trim: true, maxlength: 500 },

    // Product details
    shortDescription: { type: String, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000 },
    sizes: [{ type: String, trim: true }],
    keyFeatures: [String],
    tags: [String],

    productDetails: {
      weight: String,
      dimensions: String,
      capacity: String,
      materials: String,
    },

    // Variants
    colorVariants: [ColorVariantSchema],

    // SEO
    seoTitle: { type: String, trim: true, maxlength: 60 },
    seoDescription: { type: String, trim: true, maxlength: 160 },
    seoKeyword: { type: String, trim: true, maxlength: 200 },

    // Reviews
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    totalReviews: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },

    // Offer and stock
    offers: { type: Boolean, default: false },
    salePrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },

    // Scheduling
    isScheduled: { type: Boolean, default: false },
    scheduledPublishDate: { type: Date, default: null },
    scheduledPublishTime: { type: String, default: null },
    scheduleStatus: {
      type: String,
      enum: ["pending", "published", "cancelled"],
      default: "pending",
    },

    // Return and cancellation
    pickupLocation: { type: String, trim: true },
    return: { type: Boolean, default: true },
    cancellation: { type: Boolean, default: true },

    status: {
      type: String,
      enum: ["active", "inactive", "draft", "scheduled"],
      default: "active",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ---------- INDEXES ----------
ProductSchema.index({ vendorId: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ adminApproved: 1 });
ProductSchema.index({ available: 1 });
ProductSchema.index({ "colorVariants.isActive": 1 });

// ---------- VIRTUALS ----------
ProductSchema.virtual("discountPercentage").get(function () {
  if (this.mrp && this.price && this.mrp > this.price) {
    return Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
  return 0;
});

// ---------- PRE-SAVE ----------
ProductSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }

  if (!this.sizes || this.sizes.length === 0) {
    this.sizes = ["One Size"];
  } else {
    this.sizes = [...new Set(this.sizes.map((s) => s.trim()))];
  }

  next();
});

// ---------- METHODS ----------
ProductSchema.methods = {
  // Discount utility
  calcDiscount(price, mrp) {
    return mrp && price && mrp > price
      ? Math.round(((mrp - price) / mrp) * 100)
      : 0;
  },

  // Color helpers
  getAvailableColorVariants() {
    return this.colorVariants.filter((v) => v.isActive && v.stock > 0);
  },

  getColorVariant(colorName) {
    return this.colorVariants.find(
      (v) =>
        v.colorName.toLowerCase() === colorName.toLowerCase() && v.isActive
    );
  },

  getColorVariantByCode(colorCode) {
    return this.colorVariants.find(
      (v) =>
        v.colorCode.toLowerCase() === colorCode.toLowerCase() && v.isActive
    );
  },

  getAvailableColors() {
    return this.getAvailableColorVariants().map((v) => ({
      colorName: v.colorName,
      colorCode: v.colorCode,
      price: v.price || this.price,
      mrp: v.mrp || this.mrp,
      stock: v.stock,
      discount: this.calcDiscount(v.price || this.price, v.mrp || this.mrp),
      primaryImage: v.images.find((i) => i.is_primary)?.url || v.images[0]?.url,
      sizes: v.sizes.length ? v.sizes : this.sizes,
    }));
  },

  getColorImages(colorName) {
    const variant = this.getColorVariant(colorName);
    return variant ? variant.images : [];
  },

  getPrimaryColor() {
    const active = this.getAvailableColorVariants();
    if (!active.length) return null;
    return active.reduce((a, b) => (b.stock > a.stock ? b : a));
  },

  hasMultipleColors() {
    return this.colorVariants.length > 1;
  },
};

// ---------- CASCADE DELETE ----------
ProductSchema.pre("deleteOne", { document: true }, async function () {
  const Review = mongoose.model("Review");
  await Review.deleteMany({ proId: this._id });
});

export default mongoose.model("Product", ProductSchema);
