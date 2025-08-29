import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment
} from '../razorpay/razorpayController.js';
import { protectUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/order', protectUser, createRazorpayOrder);
router.post('/verify', protectUser, verifyRazorpayPayment);

export default router;
