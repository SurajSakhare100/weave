import asyncHandler from 'express-async-handler';
import Order from '../../models/Order.js';

// @desc    Get order statistics (Admin)
// @route   GET /api/orders/admin-stats
// @access  Private/Admin
export const getAdminOrderStats = asyncHandler(async (req, res) => {
  try {
    // Get total counts for each status
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get payment method counts
    const paymentCounts = await Order.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total orders
    const totalOrders = await Order.countDocuments();

    // Get orders by date (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Format status counts
    const formattedStatusCounts = {
      all: totalOrders,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
      refunded: 0
    };

    statusCounts.forEach(item => {
      if (item._id && formattedStatusCounts.hasOwnProperty(item._id.toLowerCase())) {
        formattedStatusCounts[item._id.toLowerCase()] = item.count;
      }
    });

    // Format payment counts
    const formattedPaymentCounts = {};
    paymentCounts.forEach(item => {
      if (item._id) {
        formattedPaymentCounts[item._id.toLowerCase()] = item.count;
      }
    });

    res.json({
      success: true,
      data: {
        statusCounts: formattedStatusCounts,
        paymentCounts: formattedPaymentCounts,
        totalOrders,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch order statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
export const getOrderStats = asyncHandler(async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          averageOrderValue: { $avg: '$totalPrice' },
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
          },
          paidOrders: {
            $sum: {
              $cond: [{ $eq: ['$isPaid', true] }, 1, 0]
            }
          },
          totalDiscount: { $sum: '$discountAmount' }
        }
      }
    ]);

    const dailyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
          discount: { $sum: '$discountAmount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const statusDistribution = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          pendingOrders: 0,
          processingOrders: 0,
          shippedOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          paidOrders: 0,
          totalDiscount: 0
        },
        dailyStats,
        statusDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
