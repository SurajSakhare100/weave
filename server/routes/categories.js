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
  addSubCategory,
  deleteMainSubCategory,
  deleteSubCategory,
  getAllTypesCategory
} from '../controllers/categoryController.js';
import {
  validateCategory,
  validateId,
  validateSearch
} from '../middleware/validation.js';
import { protectAdmin } from '../middleware/auth.js';
import multer from 'multer';

// Configure multer for optional image upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const uploadOptionalImage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
}).single('image');

const router = express.Router();

router.get('/', getCategories);
router.get('/all-types', getAllTypesCategory);
router.get('/header', getHeaderCategories);
router.get('/main-sub', getMainSubCategories);
router.get('/sub', getSubCategories);
router.get('/search', validateSearch, searchCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', validateId, getCategoryById);

router.post('/', protectAdmin, (req, res, next) => {
  uploadOptionalImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
}, validateCategory, createCategory);
router.put('/:id', protectAdmin, (req, res, next) => {
  uploadOptionalImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
}, validateId, validateCategory, updateCategory);
router.delete('/:id', protectAdmin, validateId, deleteCategory);

router.post('/:id/main-sub', protectAdmin, validateId, addMainSubCategory);
router.delete('/:id/main-sub/:uni_id', protectAdmin, validateId, deleteMainSubCategory);
router.post('/:id/sub', protectAdmin, validateId, addSubCategory);
router.delete('/:id/sub/:uni_id', protectAdmin, validateId, deleteSubCategory);

export default router; 