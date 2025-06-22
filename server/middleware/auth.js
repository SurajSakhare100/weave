import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import Admin from '../models/Admin.js';

// @desc    Protect routes - User authentication
// @route   *
// @access  Private
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// @desc    Admin authorization
// @route   *
// @access  Private/Admin
const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
});

// @desc    Vendor authentication
// @route   *
// @access  Private/Vendor
const vendorAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get vendor from the token
      req.vendor = await Vendor.findById(decoded.id).select('-password');

      if (!req.vendor) {
        res.status(401);
        throw new Error('Not authorized, vendor not found');
      }

      // Check if vendor is accepted
      if (!req.vendor.accept) {
        res.status(403);
        throw new Error('Vendor account not yet approved');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// @desc    Optional vendor authentication (doesn't require auth)
// @route   *
// @access  Public (with optional vendor info)
const optionalVendorAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get vendor from the token
      req.vendor = await Vendor.findById(decoded.id).select('-password');

      // Don't throw error if vendor not found - just continue without vendor info
      if (req.vendor && !req.vendor.accept) {
        req.vendor = null; // Clear vendor if not accepted
      }
    } catch (error) {
      // Don't throw error - just continue without vendor info
      console.log('Optional vendor auth failed:', error.message);
    }
  }

  next();
});

export { protect, admin, vendorAuth, optionalVendorAuth }; 