import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import User from '../../models/User.js';
import Vendor from '../../models/Vendor.js';

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status, search, startDate, endDate, paymentStatus, vendor } = req.query;

    // Build filter
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      filter.isPaid = paymentStatus === 'paid';
    }

    if (search) {
      filter.$or = [
        { _id: { $regex: search, $options: 'i' } },
        { 'user.firstName': { $regex: search, $options: 'i' } },
        { 'user.lastName': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } },
        { 'orderItems.productId.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Vendor filtering - if vendor filter is specified
    if (vendor && vendor !== 'all') {
      try {
        // Try to find vendor by name or ID
        let vendorDoc;
        if (mongoose.Types.ObjectId.isValid(vendor)) {
          // If vendor is a valid ObjectId, search by ID
          vendorDoc = await Vendor.findById(vendor);
        } else {
          // If vendor is a name, search by name or business name
          vendorDoc = await Vendor.findOne({
            $or: [
              { name: { $regex: vendor, $options: 'i' } },
              { businessName: { $regex: vendor, $options: 'i' } }
            ]
          });
        }

        if (vendorDoc) {
          // Find products by this vendor
          const vendorProductIds = await Product.find({ vendorId: vendorDoc._id }).distinct('_id');
          if (vendorProductIds.length > 0) {
            filter['orderItems.productId'] = { $in: vendorProductIds };
          } else {
            // If vendor has no products, return empty result
            filter._id = { $in: [] };
          }
        } else {
          // If vendor not found, return empty result
          filter._id = { $in: [] };
        }
      } catch (error) {
        console.error('Vendor filter error:', error);
        // If there's an error, ignore vendor filter
      }
    }

    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email number')
      .populate({
        path: 'orderItems.productId',
        select: 'name price category vendorId',
        populate: {
          path: 'vendorId',
          select: 'name businessName'
        }
      })
      .populate('couponCode', 'code discount type')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    // Transform orders to match frontend expectations (legacy format)
    const transformedOrders = orders.map(order => {
      // Get vendor info from order items
      const vendorInfo = order.orderItems.find(item => 
        item.productId?.vendorId
      )?.productId?.vendorId;

      return {
        _id: order._id,
        secretOrderId: order._id.toString(),
        userId: order.user._id,
        customer: `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || order.user.email,
        vendorName: vendorInfo?.businessName || vendorInfo?.name,
        vendor: vendorInfo?.businessName || vendorInfo?.name,
        price: order.totalPrice,
        date: order.createdAt,
        payType: order.paymentMethod,
        payStatus: order.isPaid ? 'paid' : 'pending',
        OrderStatus: order.status,
        OrderId: order._id.toString().slice(-8), // Last 8 characters as order ID
        // Additional fields that might be needed
        items: order.orderItems,
        shippingAddress: order.shippingAddress,
        isDelivered: order.isDelivered,
        deliveredAt: order.deliveredAt
      };
    });

    res.json({
      success: true,
      data: transformedOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      res.status(400);
      throw new Error('Status is required');
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400);
      throw new Error('Invalid status');
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.status = status;
    
    if (status === 'delivered') {
      order.deliveredAt = Date.now();
      order.isDelivered = true;
    } else if (status === 'cancelled') {
      order.cancelledAt = Date.now();
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
