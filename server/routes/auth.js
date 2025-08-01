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
  logoutVendor,
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getCurrentAdmin,
  deleteAccount
} from '../controllers/authController.js';
import { protectUser, protectVendor, protectAdmin } from '../middleware/auth.js';
import { validateUserRegistration, validateUserLogin, validateVendorRegistration, validateVendorLogin } from '../middleware/validation.js';

// User routes
router.post('/register', validateUserRegistration, registerUser);
router.post('/login', validateUserLogin, loginUser);
router.post('/logout', logoutUser);
router
  .route('/profile')
  .get(protectUser, getUserProfile)
  .put(protectUser, updateUserProfile);

// Vendor routes
router.post('/vendor/register', validateVendorRegistration, registerVendor);
router.post('/vendor/login', validateVendorLogin, loginVendor);
router.post('/vendor/logout', protectVendor, logoutVendor);

// Admin routes
router.post('/admin/register', registerAdmin);
router.post('/admin/login', loginAdmin);
router.get('/admin/me', protectAdmin, getCurrentAdmin);
router.post('/admin/logout', protectAdmin, logoutAdmin);

// Delete account route
router.delete('/account', protectUser, deleteAccount);

export default router; 