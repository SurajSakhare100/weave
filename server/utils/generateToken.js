import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const generateToken = (id, userType = 'user') => {
  return jwt.sign({ 
    id, 
    userType,
    iat: Math.floor(Date.now() / 1000)
  }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const generateUserToken = (id) => generateToken(id, 'user');
export const generateVendorToken = (id) => generateToken(id, 'vendor');
export const generateAdminToken = (id) => generateToken(id, 'admin');

export const toObjectId = (id) => {
  if (!id) return null;
  if (typeof id === 'string') {
    try {
      return new mongoose.Types.ObjectId(id);
    } catch (error) {
      return null;
    }
  }
  return id;
};

export default generateToken; 