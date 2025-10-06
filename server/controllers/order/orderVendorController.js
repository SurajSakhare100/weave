import asyncHandler from 'express-async-handler';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';

// @desc    Get vendor orders
// @route   GET /api/orders/vendor
// @access  Private (Vendor)
export const getVendorOrders = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status, search, startDate, endDate } = req.query;

    // Get vendor's product IDs
    const vendorProducts = await Product.find({ vendorId: req.vendor._id }).distinct('_id');

    if (vendorProducts.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0
        }
      });
    }

    // Build filter
    const filter = {
      'orderItems.productId': { $in: vendorProducts }
    };

    if (status && status !== 'all') {
      filter.status = status;
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

    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email number')
      .populate({
        path: 'orderItems.productId',
        select: 'name price files vendorId category',
        match: { vendorId: req.vendor._id }
      })
      .populate('couponCode', 'code discount type')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get vendor order by ID
// @route   GET /api/orders/vendor/:id
// @access  Private (Vendor)
export const getVendorOrderById = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email number')
      .populate({
        path: 'orderItems.productId',
        select: 'name price mrp discount files vendorId category'
      })
      .populate('couponCode', 'code discount type');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Return the full order with all items
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update vendor order status
// @route   PUT /api/orders/vendor/:id/status
// @access  Private (Vendor)
export const updateVendorOrderStatus = asyncHandler(async (req, res) => {
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
    
    const vendorProductIds = await Product.find({ vendorId: req.vendor._id }).distinct('_id');
    
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    let updatedItems = 0;

    const vendorItems = order.orderItems.filter(item => 
      vendorProductIds.includes(item.productId)
    );
    if (vendorItems.length > 0 && vendorItems.every(item => item.status === status)) {
      order.status = status;
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
      message: `Updated ${updatedItems} item(s) status to ${status}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get vendor order statistics
// @route   GET /api/orders/vendor/stats
// @access  Private (Vendor)
export const getVendorOrderStats = asyncHandler(async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get vendor's product IDs
    const vendorProductIds = await Product.find({ vendorId: req.vendor._id }).distinct('_id');

    if (vendorProductIds.length === 0) {
      return res.json({
        success: true,
        data: {
          summary: {
            totalOrders: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
            pendingOrders: 0,
            processingOrders: 0,
            shippedOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0
          },
          dailyStats: [],
          statusDistribution: []
        }
      });
    }

    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          'orderItems.productId': { $in: vendorProductIds }
        }
      },
      {
        $unwind: '$orderItems'
      },
      {
        $match: {
          'orderItems.productId': { $in: vendorProductIds }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $addToSet: '$_id' },
          totalRevenue: { $sum: '$orderItems.price' },
          totalItems: { $sum: '$orderItems.quantity' },
          pendingOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          processingOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'processing'] }, 1, 0]
            }
          },
          shippedOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0]
            }
          },
          completedOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0]
            }
          },
          cancelledOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const dailyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          'orderItems.productId': { $in: vendorProductIds }
        }
      },
      {
        $unwind: '$orderItems'
      },
      {
        $match: {
          'orderItems.productId': { $in: vendorProductIds }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          orders: { $addToSet: '$_id' },
          revenue: { $sum: '$orderItems.price' },
          items: { $sum: '$orderItems.quantity' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const statusDistribution = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          'orderItems.productId': { $in: vendorProductIds }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = stats[0] || {
      totalOrders: [],
      totalRevenue: 0,
      totalItems: 0,
      pendingOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0
    };

    res.json({
      success: true,
      data: {
        summary: {
          ...summary,
          totalOrders: summary.totalOrders.length,
          averageOrderValue: summary.totalOrders.length > 0 ? summary.totalRevenue / summary.totalOrders.length : 0
        },
        dailyStats: dailyStats.map(stat => ({
          ...stat,
          orders: stat.orders.length
        })),
        statusDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
