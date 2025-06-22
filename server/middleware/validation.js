import { body, param, query, validationResult } from 'express-validator';

// @desc    Handle validation errors
// @route   *
// @access  Public
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// @desc    User registration validation
// @route   POST /api/auth/register
// @access  Public
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

// @desc    User login validation
// @route   POST /api/auth/login
// @access  Public
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// @desc    Product validation
// @route   POST /api/products
// @access  Private/Vendor
const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('mrp')
    .isFloat({ min: 0 })
    .withMessage('MRP must be a positive number'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  handleValidationErrors
];

// @desc    Category validation
// @route   POST /api/categories
// @access  Private/Admin
const validateCategory = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  body('slug')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category slug must be between 2 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('image')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid image URL'),
  handleValidationErrors
];

// @desc    ID parameter validation
// @route   *
// @access  Public
const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// @desc    Pagination validation
// @route   *
// @access  Public
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// @desc    Search validation
// @route   *
// @access  Public
const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  handleValidationErrors
];

// @desc    Price range validation
// @route   *
// @access  Public
const validatePriceRange = [
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  handleValidationErrors
];

// @desc    Vendor registration validation
// @route   POST /api/auth/vendor/register
// @access  Public
const validateVendorRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

// @desc    Vendor login validation
// @route   POST /api/auth/vendor/login
// @access  Public
const validateVendorLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// @desc    Order validation
// @route   POST /api/orders
// @access  Private
const validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('shippingAddress')
    .isObject()
    .withMessage('Shipping address is required'),
  body('paymentMethod')
    .optional()
    .isIn(['razorpay', 'cod', 'stripe'])
    .withMessage('Invalid payment method'),
  handleValidationErrors
];

export {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateVendorRegistration,
  validateVendorLogin,
  validateProduct,
  validateCategory,
  validateOrder,
  validateId,
  validatePagination,
  validateSearch,
  validatePriceRange
}; 