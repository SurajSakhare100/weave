import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Wishlist from '../models/Wishlist.js';
import Review from '../models/Review.js';
import generateToken, { generateUserToken, generateVendorToken, generateAdminToken } from '../utils/generateToken.js';
import asyncHandler from 'express-async-handler';
import { sendEmail } from '../utils/emailService.js';
import crypto from 'crypto';
import Vendor from '../models/Vendor.js';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js'; // Added missing import for Admin

// Generate refresh token
const generateRefreshToken = (userId, userType = 'user') => {
  return jwt.sign(
    { userId, userType, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: generateUserToken(user._id),
        userType: 'user'
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, email, password, number } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({ firstName, lastName, email, password, number });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: generateUserToken(user._id),
        userType: 'user'
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      number: user.number,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.number = req.body.number || user.number;
    if (req.body.password) {
      user.password = req.body.password;
    }
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      number: updatedUser.number,
      token: generateUserToken(updatedUser._id),
      userType: 'user'
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Vendor login
// @route   POST /api/auth/vendor/login
// @access  Public
const loginVendor = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const vendor = await Vendor.findOne({ email }).select('+password');

  if (vendor && (await vendor.comparePassword(password))) {
    res.json({
      success: true,
      token: generateVendorToken(vendor._id),
      userType: 'vendor',
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        number: vendor.number,
        accept: vendor.accept,
        adminApproved: vendor.adminApproved,
        adminRejectionReason: vendor.adminRejectionReason,
        bankAccOwner: vendor.bankAccOwner,
        bankName: vendor.bankName,
        bankAccNumber: vendor.bankAccNumber,
        bankIFSC: vendor.bankIFSC,
        bankBranchName: vendor.bankBranchName,
        bankBranchNumber: vendor.bankBranchNumber,
        createdAt: vendor.createdAt
      }
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Vendor registration
// @route   POST /api/auth/vendor/register
// @access  Public
const registerVendor = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    number,
    bankAccOwner,
    bankName,
    bankAccNumber,
    bankIFSC,
    bankBranchName,
    bankBranchNumber
  } = req.body;

  const vendorExists = await Vendor.findOne({ email });

  if (vendorExists) {
    res.status(400);
    throw new Error('Vendor with this email already exists');
  }

  const vendor = await Vendor.create({
    name,
    email,
    password,
    number,
    bankAccOwner,
    bankName,
    bankAccNumber,
    bankIFSC,
    bankBranchName,
    bankBranchNumber,
    accept: false, // Don't auto-approve vendors
    adminApproved: false // Require admin approval
  });

  if (vendor) {
    res.status(201).json({
      success: true,
      token: generateVendorToken(vendor._id),
      userType: 'vendor',
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        number: vendor.number,
        accept: vendor.accept,
        adminApproved: vendor.adminApproved,
        adminRejectionReason: vendor.adminRejectionReason,
        bankAccOwner: vendor.bankAccOwner,
        bankName: vendor.bankName,
        bankAccNumber: vendor.bankAccNumber,
        bankIFSC: vendor.bankIFSC,
        bankBranchName: vendor.bankBranchName,
        bankBranchNumber: vendor.bankBranchNumber,
        createdAt: vendor.createdAt
      }
    });
  } else {
    res.status(400);
    throw new Error('Invalid vendor data');
  }
});

// @desc    Vendor logout
// @route   POST /api/auth/vendor/logout
// @access  Private
const logoutVendor = (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Vendor logged out successfully' 
  });
};

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email }).select('+password');

  if (admin && (await admin.comparePassword(password))) {
    // Generate JWT token
    const token = generateAdminToken(admin._id);
    
    // Set secure HTTP-only cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'strict',
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
const registerAdmin = asyncHandler(async (req, res) => {
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
      sameSite: 'strict',
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
const getCurrentAdmin = asyncHandler(async (req, res) => {
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
const logoutAdmin = (req, res) => {
  // Clear the admin token cookie
  res.cookie('adminToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/'
  });

  res.status(200).json({ 
    success: true,
    message: 'Admin logged out successfully' 
  });
};

// Forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists or not
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  // Send reset email
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your password',
    template: 'passwordReset',
    data: {
      name: user.firstName,
      resetUrl
    }
  });

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.'
  });
};

// Reset password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }

  // Update password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful'
  });
};

// Verify email
const verifyEmail = async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token'
    });
  }

  // Verify email
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
};

// Resend verification email
const resendVerification = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: 'Email is already verified'
    });
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save();

  // Send verification email
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your email address',
    template: 'emailVerification',
    data: {
      name: user.firstName,
      verificationUrl
    }
  });

  res.json({
    success: true,
    message: 'Verification email sent successfully'
  });
};

// Refresh token
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Generate new access token based on user type
    let newAccessToken;
    switch (decoded.userType) {
      case 'user':
        newAccessToken = generateUserToken(decoded.userId);
        break;
      case 'vendor':
        newAccessToken = generateVendorToken(decoded.userId);
        break;
      case 'admin':
        newAccessToken = generateAdminToken(decoded.userId);
        break;
      default:
        return res.status(401).json({
          success: false,
          message: 'Invalid user type'
        });
    }

    res.json({
      success: true,
      token: newAccessToken,
      userType: decoded.userType
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  const { currentPassword, password } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = password;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
};

// Update profile
const updateProfile = async (req, res) => {
  const { firstName, lastName, phone, addresses, preferences } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Update fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.number = phone;
  if (addresses) user.addresses = addresses;
  if (preferences) user.preferences = { ...user.preferences, ...preferences };

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        number: user.number
      }
    }
  });
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

    // Delete all user-related data
    const userId = req.user._id;

    // Delete user's cart
    await Cart.deleteMany({ user: userId });

    // Delete user's orders
    await Order.deleteMany({ user: userId });

    // Delete user's wishlist
    await Wishlist.deleteMany({ user: userId });

    // Delete user's addresses (if stored separately)
    // Note: If addresses are embedded in user document, they'll be deleted with user

    // Delete user's reviews
    await Review.deleteMany({ user: userId });

    // Finally, delete the user account
    await User.findByIdAndDelete(userId);

  res.json({
    success: true,
      message: 'Account and all associated data deleted successfully'
  });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account'
    });
  }
};

export {
  loginUser,
  registerUser,
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
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  refreshToken,
  changePassword,
  updateProfile,
  deleteAccount
}; 