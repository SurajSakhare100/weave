import jwt from 'jsonwebtoken';
import { generateUserToken, generateVendorToken, generateAdminToken } from '../../utils/generateToken.js';

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (req, res) => {
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
