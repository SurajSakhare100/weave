import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { uploadImage, deleteImage } from '../utils/imageUpload.js';

// @desc    Get all categories
// @route   GET /api/categories/all-types
// @access  Public
export const getAllTypesCategory = asyncHandler(async (req, res) => {
  try {
    // Get all categories
    const categories = await Category.find().sort('name');

    res.json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find().sort('name');

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.json({
    success: true,
    data: category
  });
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.json({
    success: true,
    data: category
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin)
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, slug, header, uni_id1, uni_id2 } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }

  // Generate slug if not provided
  const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Check if category already exists
  const existingCategory = await Category.findOne({ 
    $or: [{ name }, { slug: categorySlug }] 
  });

  if (existingCategory) {
    res.status(400);
    throw new Error('Category with this name or slug already exists');
  }

  let imageUrl = null;
  let imagePublicId = null;

  // Handle image upload if file is provided
  if (req.file) {
    try {
      const uploadResult = await uploadImage(req.file.buffer, 'weave-categories');
      imageUrl = uploadResult.url;
      imagePublicId = uploadResult.public_id;
    } catch (uploadError) {
      console.error('Image upload error:', uploadError);
      res.status(500);
      throw new Error('Failed to upload image');
    }
  }

  const categoryData = {
    name,
    description,
    slug: categorySlug,
    header: header || false,
    image: imageUrl,
    imagePublicId: imagePublicId,
    uni_id1: uni_id1 || Date.now() + Math.random(),
    uni_id2: uni_id2 || Date.now() + Math.random()
  };

  const category = await Category.create(categoryData);

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, slug, header, uni_id1, uni_id2 } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }

  // Generate slug if not provided
  let categorySlug = slug;
  if (!categorySlug) {
    categorySlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug: categorySlug, _id: { $ne: req.params.id } });
    if (existingCategory) {
      categorySlug = `${categorySlug}-${Date.now()}`;
    }
  }

  let imageUrl = category.image; // Keep existing image by default
  let imagePublicId = category.imagePublicId; // Keep existing public ID by default

  // Handle image upload if new file is provided
  if (req.file) {
    try {
      // Delete old image if it exists
      if (category.imagePublicId) {
        try {
          await deleteImage(category.imagePublicId);
        } catch (deleteError) {
          console.error('Error deleting old image:', deleteError);
          // Continue with upload even if deletion fails
        }
      }

      // Upload new image
      const uploadResult = await uploadImage(req.file.buffer, 'weave-categories');
      imageUrl = uploadResult.url;
      imagePublicId = uploadResult.public_id;
    } catch (uploadError) {
      console.error('Image upload error:', uploadError);
      res.status(500);
      throw new Error('Failed to upload image');
    }
  }

  const categoryData = {
    name,
    description: description || category.description,
    slug: categorySlug,
    header: header !== undefined ? header : category.header,
    image: imageUrl,
    imagePublicId: imagePublicId,
    uni_id1: uni_id1 || category.uni_id1,
    uni_id2: uni_id2 || category.uni_id2
  };

  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    categoryData,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: updatedCategory
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Check if category has products
  const productCount = await Product.countDocuments({ categorySlug: category.slug });
  if (productCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete category. It has ${productCount} products associated with it.`);
  }

  await Category.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// @desc    Search categories
// @route   GET /api/categories/search
// @access  Public
export const searchCategories = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    res.status(400);
    throw new Error('Search query must be at least 2 characters long');
  }

  const categories = await Category.find({
    name: { $regex: q, $options: 'i' }
  }).limit(10);

  res.json({
    success: true,
    data: categories
  });
});

// @desc    Get header categories
// @route   GET /api/categories/header
// @access  Public
export const getHeaderCategories = asyncHandler(async (req, res) => {
  // const categories = await Category.find({ header: true }).sort('name').select('name slug');
  const categories = await Category.find({  }).sort('name').select('name slug');
  res.json({
    success: true,
    data: categories
  });
});



 