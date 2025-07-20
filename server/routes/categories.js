import express from 'express';
import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  searchCategories,
  getHeaderCategories,
  getMainSubCategories,
  getSubCategories,
  addMainSubCategory,
  addSubCategory
} from '../controllers/categoryController.js';
import {
  validateCategory,
  validateId,
  validateSearch
} from '../middleware/validation.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/header', getHeaderCategories);
router.get('/main-sub', getMainSubCategories);
router.get('/sub', getSubCategories);
router.get('/search', validateSearch, searchCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', validateId, getCategoryById);

router.post('/', protect, admin, validateCategory, createCategory);
router.put('/:id', protect, admin, validateId, validateCategory, updateCategory);
router.delete('/:id', protect, admin, validateId, deleteCategory);

router.post('/:id/main-sub', protect, admin, validateId, addMainSubCategory);
router.post('/:id/sub', protect, admin, validateId, addSubCategory);

export default router; 