import Vendor from '../../models/Vendor.js';
import { generateVendorToken } from '../../utils/generateToken.js';
import asyncHandler from 'express-async-handler';

// @desc    Vendor login
// @route   POST /api/auth/vendor/login
// @access  Public
export const loginVendor = asyncHandler(async (req, res) => {
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
        businessName: vendor.businessName,
        address: vendor.address,
        city: vendor.city,
        state: vendor.state,
        pinCode: vendor.pinCode,
        adminApproved: vendor.adminApproved,
        adminApprovedAt: vendor.adminApprovedAt,
        adminApprovedBy: vendor.adminApprovedBy,
        adminRejectionReason: vendor.adminRejectionReason,
        adminApprovalFeedback: vendor.adminApprovalFeedback,
        status: vendor.status,
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
export const registerVendor = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    number,
    businessName,
    address,
    city,
    state,
    pinCode
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
    businessName,
    address,
    city,
    state,
    pinCode,
    adminApproved: false, // Require admin approval
    status: 'pending'
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
        businessName: vendor.businessName,
        address: vendor.address,
        city: vendor.city,
        state: vendor.state,
        pinCode: vendor.pinCode,
        adminApproved: vendor.adminApproved,
        status: vendor.status,
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
export const logoutVendor = (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Vendor logged out successfully' 
  });
};
