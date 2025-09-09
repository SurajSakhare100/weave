import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import Admin from '../models/Admin.js';

// Universal token verification middleware
const verifyToken = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header (for API calls)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies (for admin authentication)
  else if (req.cookies && req.cookies.adminToken) {
    token = req.cookies.adminToken;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token has the required fields
      if (!decoded.id) {
        console.error('Token missing id field:', decoded);
        return res.status(401).json({ message: 'Invalid token structure - missing id' });
      }

      if (!decoded.userType) {
        console.error('Token missing userType field:', decoded);
        return res.status(401).json({ message: 'Invalid token structure - missing userType' });
      }
      
      // Store decoded token info
      req.tokenInfo = {
        id: decoded.id,
        userType: decoded.userType,
        iat: decoded.iat
      };

      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
});

// User authentication middleware
const protectUser = asyncHandler(async (req, res, next) => {
  await verifyToken(req, res, async () => {
    try {
      // Verify token is for user type
      if (req.tokenInfo.userType !== 'user') {
        console.error('Expected user token, got:', req.tokenInfo.userType);
        return res.status(403).json({ message: 'Access denied. User token required.' });
      }

      const user = await User.findById(req.tokenInfo.id).select('-password');
      if (!user) {
        console.error('User not found for id:', req.tokenInfo.id);
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('User authentication failed:', error.message);
      return res.status(401).json({ message: 'User authentication failed' });
    }
  });
});

// Vendor authentication middleware (allows access but checks approval status)
const protectVendorWithStatus = asyncHandler(async (req, res, next) => {
  await verifyToken(req, res, async () => {
    try {
      // Verify token is for vendor type
      if (req.tokenInfo.userType !== 'vendor') {
        console.error('Expected vendor token, got:', req.tokenInfo.userType);
        return res.status(403).json({ message: 'Access denied. Vendor token required.' });
      }

      const vendor = await Vendor.findById(req.tokenInfo.id).select('-password');
      if (!vendor) {
        console.error('Vendor not found for id:', req.tokenInfo.id);
        return res.status(401).json({ message: 'Not authorized, vendor not found' });
      }

      // Always allow access but provide approval status
      req.vendor = vendor;
      req.vendorApprovalStatus = {
        isApproved: vendor.adminApproved,
        rejectionReason: vendor.adminRejectionReason,
        needsApproval: !vendor.adminApproved
      };
      
      next();
    } catch (error) {
      console.error('Vendor authentication failed:', error.message);
      return res.status(401).json({ message: 'Vendor authentication failed' });
    }
  });
});

// Vendor authentication middleware (strict - requires approval)
const protectVendor = asyncHandler(async (req, res, next) => {
  await verifyToken(req, res, async () => {
    try {
      // Verify token is for vendor type
      if (req.tokenInfo.userType !== 'vendor') {
        console.error('Expected vendor token, got:', req.tokenInfo.userType);
        return res.status(403).json({ message: 'Access denied. Vendor token required.' });
      }

      const vendor = await Vendor.findById(req.tokenInfo.id).select('-password');
      if (!vendor) {
        console.error('Vendor not found for id:', req.tokenInfo.id);
        return res.status(401).json({ message: 'Not authorized, vendor not found' });
      }

      if (!vendor.adminApproved) {
        return res.status(403).json({ message: 'Vendor account not yet approved by admin' });
      }

      req.vendor = vendor;
      next();
    } catch (error) {
      console.error('Vendor authentication failed:', error.message);
      return res.status(401).json({ message: 'Vendor authentication failed' });
    }
  });
});

// Admin authentication middleware
const protectAdmin = asyncHandler(async (req, res, next) => {
  await verifyToken(req, res, async () => {
    try {
      // Verify token is for admin type
      if (req.tokenInfo.userType !== 'admin') {
        console.error('Expected admin token, got:', req.tokenInfo.userType);
        return res.status(403).json({ message: 'Access denied. Admin token required.' });
      }

      const admin = await Admin.findById(req.tokenInfo.id).select('-password');
      if (!admin) {
        console.error('Admin not found for id:', req.tokenInfo.id);
        return res.status(401).json({ message: 'Not authorized, admin not found' });
      }

      if (!admin.isActive) {
        return res.status(403).json({ message: 'Admin account is deactivated' });
      }

      req.admin = admin;
      next();
    } catch (error) {
      console.error('Admin authentication failed:', error.message);
      return res.status(401).json({ message: 'Admin authentication failed' });
    }
  });
});

// Optional user authentication (for public routes that can work with or without auth)
const optionalUserAuth = asyncHandler(async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.userType === 'user') {
        const user = await User.findById(decoded.id).select('-password');
        if (user && user.isActive) {
          req.user = user;
        }
      }
    }
  } catch (error) {
    // Silently fail for optional auth
    console.log('Optional user auth failed:', error.message);
  }
  next();
});

// Optional vendor authentication
const optionalVendorAuth = asyncHandler(async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.userType === 'vendor') {
        const vendor = await Vendor.findById(decoded.id).select('-password');
        if (vendor && vendor.adminApproved) {
          req.vendor = vendor;
        }
      }
    }
  } catch (error) {
    console.log('Optional vendor auth failed:', error.message);
  }
  next();
});

// Multi-user authentication (accepts any valid user type)
const protectAny = asyncHandler(async (req, res, next) => {
  await verifyToken(req, res, async () => {
    try {
      const { userType, id } = req.tokenInfo;
      
      switch (userType) {
        case 'user':
          const user = await User.findById(id).select('-password');
          if (!user || !user.isActive) {
            return res.status(401).json({ message: 'User not found or inactive' });
          }
          req.user = user;
          break;
          
        case 'vendor':
          const vendor = await Vendor.findById(id).select('-password');
          if (!vendor || !vendor.accept) {
            return res.status(401).json({ message: 'Vendor not found or not approved' });
          }
          req.vendor = vendor;
          break;
          
        case 'admin':
          const admin = await Admin.findById(id).select('-password');
          if (!admin || !admin.isActive) {
            return res.status(401).json({ message: 'Admin not found or inactive' });
          }
          req.admin = admin;
          break;
          
        default:
          return res.status(403).json({ message: 'Invalid user type' });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
  });
});

export { 
  protectUser, 
  protectVendor, 
  protectVendorWithStatus, 
  protectAdmin, 
  protectAny,
  optionalUserAuth,
  optionalVendorAuth,
  verifyToken
}; 