import Admin from '../../models/Admin.js';
import { generateAdminToken } from '../../utils/generateToken.js';
import asyncHandler from 'express-async-handler';

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email }).select('+password');

  if (admin && (await admin.comparePassword(password))) {
    // Generate JWT token
    const token = generateAdminToken(admin._id);
    
    // Set secure HTTP-only cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Allow cross-origin in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    res.json({
      success: true,
      userType: 'admin',
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        isActive: admin.isActive
      }
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Admin registration
// @route   POST /api/auth/admin/register
// @access  Public
export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  // Check if admin already exists
  const adminExists = await Admin.findOne({ email });
  if (adminExists) {
    res.status(400);
    throw new Error('Admin with this email already exists');
  }

  // Create new admin
  const admin = await Admin.create({
    name,
    email,
    password
  });

  if (admin) {
    // Generate JWT token
    const token = generateAdminToken(admin._id);
    
    // Set secure HTTP-only cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Allow cross-origin in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    res.status(201).json({
      success: true,
      userType: 'admin',
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        isActive: admin.isActive
      }
    });
  } else {
    res.status(400);
    throw new Error('Invalid admin data');
  }
});

// @desc    Get current admin
// @route   GET /api/auth/admin/me
// @access  Private
export const getCurrentAdmin = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    admin: {
      _id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      isActive: req.admin.isActive
    }
  });
});

// @desc    Admin logout
// @route   POST /api/auth/admin/logout
// @access  Private
export const logoutAdmin = (req, res) => {
  // Clear the admin token cookie
  res.cookie('adminToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Allow cross-origin in production
    expires: new Date(0),
    path: '/'
  });

  res.status(200).json({ 
    success: true,
    message: 'Admin logged out successfully' 
  });
};
