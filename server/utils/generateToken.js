import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Utility function to safely convert string to ObjectId
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