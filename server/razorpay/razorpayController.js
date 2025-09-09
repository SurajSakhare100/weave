import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';
import VendorSales from '../models/VendorSales.js';
import StockMovement from '../models/StockMovement.js';
import dotenv from 'dotenv';

dotenv.config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

// @desc    Create Razorpay order
// @route   POST /api/razorpay/order
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency, orderId } = req.body;

  if (!amount || !currency || !orderId) {
    res.status(400);
    throw new Error('Amount, currency, and orderId are required');
  }

  const options = {
    amount: amount * 100, // amount in paisa
    currency,
    receipt: orderId, // Use your internal order ID as receipt
    notes: {
      orderId: orderId,
      userId: req.user._id.toString(),
    },
  };

  try {
    const razorpayOrder = await razorpayInstance.orders.create(options);
    res.status(201).json({
      success: true,
      orderId: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
      message: 'Razorpay order created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order',
      error: error.message,
    });
  }
});

// @desc    Verify Razorpay payment
// @route   POST /api/razorpay/verify
// @access  Private
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId, // Your internal order ID
  } = req.body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !orderId
  ) {
    res.status(400);
    throw new Error('Missing Razorpay payment verification details');
  }

  const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest('hex');

  if (digest === razorpay_signature) {
    // Payment is authentic, now update your internal order status
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.isPaid) {
      res.status(400);
      throw new Error('Order is already paid');
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: razorpay_payment_id,
      status: 'succeeded',
      update_time: new Date().toISOString(),
      email_address: req.user.email, // Assuming user is authenticated
      order_id: razorpay_order_id, // Store Razorpay order ID
      signature: razorpay_signature, // Store Razorpay signature
    };
    order.paymentMethod = 'online'; // Ensure payment method is set to online
    order.status = 'processing'; // Update order status to processing after payment

    const updatedOrder = await order.save();

    // Record online sales for each vendor
    try {
      // Check if sales already recorded for this order
      const existingSales = await VendorSales.findOne({ orderId: updatedOrder._id });
      
      if (!existingSales) {
        // Populate order with product details
        const populatedOrder = await Order.findById(updatedOrder._id)
          .populate('orderItems.productId')
          .populate('user');
        
        // Process each item in the order
        for (const item of populatedOrder.orderItems) {
          const product = await Product.findById(item.productId);
          if (!product) {
            console.error(`Product not found: ${item.productId}`);
            continue;
          }
          
          const vendor = await Vendor.findById(product.vendorId);
          if (!vendor) {
            console.error(`Vendor not found for product: ${item.productId}`);
            continue;
          }
          
          // Calculate platform commission (5% of sale)
          const platformCommissionRate = 0.05;
          const saleAmount = item.price * item.quantity;
          const platformCommission = saleAmount * platformCommissionRate;
          const netAmount = saleAmount - platformCommission;
          
          // Create sales record for vendor
          const sale = await VendorSales.create({
            vendorId: product.vendorId,
            productId: item.productId,
            saleType: 'online',
            quantity: item.quantity,
            unitPrice: item.price,
            totalAmount: saleAmount,
            customerName: populatedOrder.shippingAddress?.name || populatedOrder.user?.firstName || 'Online Customer',
            customerPhone: populatedOrder.shippingAddress?.phone || populatedOrder.user?.number,
            customerEmail: populatedOrder.user?.email,
            paymentMethod: 'razorpay',
            discount: 0, // Order-level discounts handled separately
            platformCommission,
            netAmount,
            orderId: populatedOrder._id,
            status: 'completed',
            saleDate: new Date(),
            notes: `Razorpay Payment ID: ${razorpay_payment_id}`
          });
          
          console.log(`Sales record created for vendor ${vendor.businessName}: ${sale._id}`);
          
          // Update product stock if vendor has auto-deduction enabled
          if (vendor.autoStockDeduction) {
            const previousStock = product.stock;
            product.stock -= item.quantity;
            await product.save();
            
            // Record stock movement
            await StockMovement.create({
              vendorId: product.vendorId,
              productId: item.productId,
              movementType: 'out',
              quantity: -item.quantity,
              previousStock,
              newStock: product.stock,
              referenceType: 'online_order',
              referenceId: populatedOrder._id.toString(),
              reason: 'Online sale via Razorpay',
              notes: `Order #${populatedOrder._id}, Payment: ${razorpay_payment_id}`,
              createdBy: populatedOrder.user._id,
              createdByModel: 'User'
            });
            
            console.log(`Stock updated for product ${product.name}: ${previousStock} -> ${product.stock}`);
          }
          
          // Update vendor sales statistics
          await vendor.updateSalesStats();
        }
        
        console.log(`Online sales recorded successfully for order ${updatedOrder._id}`);
      } else {
        console.log(`Sales already recorded for order ${updatedOrder._id}`);
      }
    } catch (salesError) {
      console.error('Error recording online sales:', salesError);
      // Don't fail the payment verification if sales recording fails
      // Sales can be recorded later via admin panel if needed
    }

    res.json({
      success: true,
      message: 'Payment verified, order updated, and sales recorded',
      order: updatedOrder,
    });
  } else {
    res.status(400);
    throw new Error('Payment signature verification failed');
  }
});

export {
  createRazorpayOrder,
  verifyRazorpayPayment
};
