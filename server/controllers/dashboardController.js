const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

// Get dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [
      totalCustomers,
      totalProducts,
      totalOrders,
      revenueData
    ] = await Promise.all([
      Customer.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
      ])
    ]);
    
    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    
    res.json({
      success: true,
      data: {
        totalCustomers,
        totalProducts,
        totalOrders,
        totalRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get sales data
exports.getSalesData = async (req, res) => {
  try {
    const { period = '6months' } = req.query;
    
    let startDate;
    const now = new Date();
    
    switch (period) {
      case '7days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30days':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '6months':
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
    }
    
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['completed', 'in-progress'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          sales: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Format data for charts
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedData = salesData.map(item => ({
      name: monthNames[item._id.month - 1],
      sales: item.sales,
      orders: item.orders
    }));
    
    res.json({ success: true, data: formattedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get sales by category
exports.getSalesByCategory = async (req, res) => {
  try {
    const salesByCategory = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          value: { $sum: '$items.subtotal' },
          count: { $sum: '$items.quantity' }
        }
      },
      { $sort: { value: -1 } }
    ]);
    
    const formattedData = salesByCategory.map(item => ({
      name: item._id,
      value: item.value,
      count: item.count
    }));
    
    res.json({ success: true, data: formattedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get recent orders
exports.getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name')
      .populate('items.product', 'name')
      .sort('-createdAt')
      .limit(10);
    
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get top customers
exports.getTopCustomers = async (req, res) => {
  try {
    const topCustomers = await Customer.find()
      .sort({ totalSpent: -1 })
      .limit(5)
      .select('name totalOrders totalSpent');
    
    res.json({ success: true, data: topCustomers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get top products
exports.getTopProducts = async (req, res) => {
  try {
    const topProducts = await Product.find({ isActive: true })
      .sort({ totalSold: -1 })
      .limit(5)
      .select('name category totalSold price');
    
    res.json({ success: true, data: topProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get summary for today
exports.getTodaySummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [todayOrders, pendingOrders, completedToday] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ 
        status: 'completed', 
        actualCompletionDate: { $gte: today } 
      })
    ]);
    
    const todayRevenue = await Order.aggregate([
      { 
        $match: { 
          status: 'completed',
          actualCompletionDate: { $gte: today }
        } 
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    res.json({
      success: true,
      data: {
        todayOrders,
        pendingOrders,
        completedToday,
        todayRevenue: todayRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
