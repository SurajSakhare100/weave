import express from 'express';
const router = express.Router();
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  registerVendor,
  loginVendor,
  logoutVendor
} from '../controllers/authController.js';
import { protect, vendorAuth } from '../middleware/auth.js';
import { validateUserRegistration, validateUserLogin, validateVendorRegistration, validateVendorLogin } from '../middleware/validation.js';

// User routes
router.post('/register', validateUserRegistration, registerUser);
router.post('/login', validateUserLogin, loginUser);
router.post('/logout', logoutUser);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Vendor routes
router.post('/vendor/register', validateVendorRegistration, registerVendor);
router.post('/vendor/login', validateVendorLogin, loginVendor);
router.post('/vendor/logout', vendorAuth, logoutVendor);

export default router; 