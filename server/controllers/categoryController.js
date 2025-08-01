import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { uploadImage, deleteImage } from '../utils/imageUpload.js';

// @desc    Get all categories with main sub and sub categories
// @route   GET /api/categories/all-types
// @access  Public
export const getAllTypesCategory = asyncHandler(async (req, res) => {
  try {
    // Get all categories
    const categories = await Category.find().sort('name');

    // Get main sub categories using aggregation
    const mainSubCategories = await Category.aggregate([
      { $unwind: "$mainSub" },
      {
        $project: {
          name: '$mainSub.name',
          category: '$mainSub.category',
          uni_id: '$mainSub.uni_id',
          slug: '$mainSub.slug'
        }
      },
      { $sort: { name: 1 } }
    ]);

    // Get sub categories using aggregation
    const subCategories = await Category.aggregate([
      { $unwind: "$sub" },
      {
        $project: {
          uni_id: "$sub.uni_id",
          slug: "$sub.slug",
          name: "$sub.name",
          mainSubSlug: "$sub.mainSubSlug",
          mainSub: "$sub.mainSub",
          category: "$sub.category"
        }
      },
      { $sort: { mainSub: 1, name: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        categories,
        mainSub: mainSubCategories,
        subCategory: subCategories
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
  const { name, description, slug, header, mainSub, sub, uni_id1, uni_id2 } = req.body;

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
    mainSub: mainSub || [],
    sub: sub || [],
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
  const { name, description, slug, header, mainSub, sub, uni_id1, uni_id2 } = req.body;

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
    mainSub: mainSub || category.mainSub,
    sub: sub || category.sub,
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
  const categories = await Category.find({ header: true }).sort('name');

  res.json({
    success: true,
    data: categories
  });
});

// @desc    Get main sub categories
// @route   GET /api/categories/main-sub
// @access  Public
export const getMainSubCategories = asyncHandler(async (req, res) => {
  const mainSubCategories = await Category.aggregate([
    { $unwind: "$mainSub" },
    {
      $project: {
        name: '$mainSub.name',
        category: '$mainSub.category',
        uni_id: '$mainSub.uni_id',
        slug: '$mainSub.slug'
      }
    },
    { $sort: { name: 1 } }
  ]);

  res.json({
    success: true,
    data: mainSubCategories
  });
});

// @desc    Get sub categories
// @route   GET /api/categories/sub
// @access  Public
export const getSubCategories = asyncHandler(async (req, res) => {
  const subCategories = await Category.aggregate([
    { $unwind: "$sub" },
    {
      $project: {
        uni_id: "$sub.uni_id",
        slug: "$sub.slug",
        name: "$sub.name",
        mainSubSlug: "$sub.mainSubSlug",
        mainSub: "$sub.mainSub",
        category: "$sub.category"
      }
    },
    { $sort: { mainSub: 1, name: 1 } }
  ]);

  res.json({
    success: true,
    data: subCategories
  });
});

// @desc    Add main sub category
// @route   POST /api/categories/:id/main-sub
// @access  Private (Admin)
export const addMainSubCategory = asyncHandler(async (req, res) => {
  const { name, category, uni_id } = req.body;

  const categoryDoc = await Category.findById(req.params.id);

  if (!categoryDoc) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Generate slug
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Check if main sub category already exists
  const existingMainSub = categoryDoc.mainSub.find(sub => sub.name === name);
  if (existingMainSub) {
    res.status(400);
    throw new Error('Main sub category with this name already exists');
  }

  categoryDoc.mainSub.push({
    name,
    category,
    uni_id,
    slug
  });

  await categoryDoc.save();

  res.json({
    success: true,
    data: categoryDoc
  });
});

// @desc    Add sub category
// @route   POST /api/categories/:id/sub
// @access  Private (Admin)
export const addSubCategory = asyncHandler(async (req, res) => {
  const { name, mainSub, category, uni_id } = req.body;

  const categoryDoc = await Category.findById(req.params.id);

  if (!categoryDoc) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Generate slug
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const mainSubSlug = mainSub.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Check if sub category already exists
  const existingSub = categoryDoc.sub.find(sub => sub.name === name);
  if (existingSub) {
    res.status(400);
    throw new Error('Sub category with this name already exists');
  }

  categoryDoc.sub.push({
    name,
    mainSub,
    mainSubSlug,
    category,
    uni_id,
    slug
  });

  await categoryDoc.save();

  res.json({
    success: true,
    data: categoryDoc
  });
});

// @desc    Delete main sub category
// @route   DELETE /api/categories/:id/main-sub/:uni_id
// @access  Private (Admin)
export const deleteMainSubCategory = asyncHandler(async (req, res) => {
  const { id, uni_id } = req.params;

  const categoryDoc = await Category.findById(id);

  if (!categoryDoc) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Find and remove the main sub category
  const mainSubIndex = categoryDoc.mainSub.findIndex(sub => sub.uni_id === uni_id);
  
  if (mainSubIndex === -1) {
    res.status(404);
    throw new Error('Main sub category not found');
  }

  // Remove the main sub category
  categoryDoc.mainSub.splice(mainSubIndex, 1);

  // Also remove any sub categories that belong to this main sub
  categoryDoc.sub = categoryDoc.sub.filter(sub => sub.mainSub !== categoryDoc.mainSub[mainSubIndex]?.name);

  await categoryDoc.save();

  res.json({
    success: true,
    message: 'Main sub category deleted successfully'
  });
});

// @desc    Delete sub category
// @route   DELETE /api/categories/:id/sub/:uni_id
// @access  Private (Admin)
export const deleteSubCategory = asyncHandler(async (req, res) => {
  const { id, uni_id } = req.params;

  const categoryDoc = await Category.findById(id);

  if (!categoryDoc) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Find and remove the sub category
  const subIndex = categoryDoc.sub.findIndex(sub => sub.uni_id === uni_id);
  
  if (subIndex === -1) {
    res.status(404);
    throw new Error('Sub category not found');
  }

  // Remove the sub category
  categoryDoc.sub.splice(subIndex, 1);

  await categoryDoc.save();

  res.json({
    success: true,
    message: 'Sub category deleted successfully'
  });
}); 