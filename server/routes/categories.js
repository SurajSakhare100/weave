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
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/header', getHeaderCategories);
router.get('/main-sub', getMainSubCategories);
router.get('/sub', getSubCategories);
router.get('/search', validateSearch, searchCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', validateId, getCategoryById);

router.post('/', protectAdmin, validateCategory, createCategory);
router.put('/:id', protectAdmin, validateId, validateCategory, updateCategory);
router.delete('/:id', protectAdmin, validateId, deleteCategory);

router.post('/:id/main-sub', protectAdmin, validateId, addMainSubCategory);
router.post('/:id/sub', protectAdmin, validateId, addSubCategory);

export default router; 