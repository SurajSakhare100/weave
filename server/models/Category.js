import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters'],
  },
  slug: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    default: null,
    trim: true,
  },
  image: {
    type: String,
    default: null,
  },
  imagePublicId: {
    type: String,
    default: null,
  },
  header: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// When deleting category, remove its reference from products
CategorySchema.pre('deleteOne', { document: true, query: false }, async function () {
  const Product = mongoose.model('Product');
  await Product.updateMany(
    { category: this._id },
    { $unset: { category: '' } }
  );
});

// Indexes for performance
CategorySchema.index({ slug: 1 });
CategorySchema.index({ header: 1 });

const Category = mongoose.model('Category', CategorySchema);
export default Category;
