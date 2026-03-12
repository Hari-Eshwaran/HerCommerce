const Order = require('../models/Order');

/**
 * Sales Prediction Service
 * Uses statistical analysis to predict future sales based on historical data
 */

/**
 * Get orders from the last N days
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} - Array of orders
 */
async function getOrdersForPeriod(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await Order.find({
    createdAt: { $gte: startDate }
  }).populate('productId', 'price');
}

/**
 * Calculate daily averages and trends
 * @param {Array} orders - Array of order documents
 * @returns {Object} - Statistics object
 */
function calculateStatistics(orders) {
  if (orders.length === 0) {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      avgDailyOrders: 0,
      avgOrderValue: 0,
      trend: 0
    };
  }

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const avgOrderValue = totalRevenue / orders.length;

  // Group orders by day
  const ordersByDay = {};
  orders.forEach(order => {
    const date = order.createdAt.toISOString().split('T')[0];
    if (!ordersByDay[date]) {
      ordersByDay[date] = { count: 0, revenue: 0 };
    }
    ordersByDay[date].count++;
    ordersByDay[date].revenue += order.totalPrice || 0;
  });

  const days = Object.keys(ordersByDay).sort();
  const dailyCounts = days.map(d => ordersByDay[d].count);
  
  // Calculate trend using simple linear regression
  let trend = 0;
  if (dailyCounts.length >= 7) {
    const firstWeekAvg = dailyCounts.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
    const lastWeekAvg = dailyCounts.slice(-7).reduce((a, b) => a + b, 0) / 7;
    trend = (lastWeekAvg - firstWeekAvg) / firstWeekAvg;
  }

  return {
    totalOrders: orders.length,
    totalRevenue,
    avgDailyOrders: orders.length / Math.max(days.length, 1),
    avgOrderValue,
    trend,
    dailyData: ordersByDay
  };
}

/**
 * Predict sales for the next week
 * @param {Object} stats - Statistics from calculateStatistics
 * @returns {Object} - Prediction results
 */
function predictNextWeek(stats) {
  const { avgDailyOrders, avgOrderValue, trend } = stats;

  // Apply trend adjustment (capped at +/- 50%)
  const trendMultiplier = 1 + Math.max(-0.5, Math.min(0.5, trend));
  
  // Predict orders for next 7 days
  const predictedOrdersNextWeek = Math.round(avgDailyOrders * 7 * trendMultiplier);
  
  // Predict revenue
  const expectedRevenue = Math.round(predictedOrdersNextWeek * avgOrderValue);

  // Calculate confidence based on data quality
  const confidence = Math.min(0.9, 0.5 + (stats.totalOrders / 100) * 0.4);

  return {
    predictedOrdersNextWeek,
    expectedRevenue,
    confidence: Math.round(confidence * 100),
    trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
    trendPercentage: Math.round(trend * 100)
  };
}

/**
 * Main prediction function
 * @returns {Promise<Object>} - Prediction results with historical data
 */
async function getSalesPrediction() {
  try {
    // Get last 30 days of orders
    const orders = await getOrdersForPeriod(30);
    
    // Calculate statistics
    const stats = calculateStatistics(orders);
    
    // Generate prediction
    const prediction = predictNextWeek(stats);

    // Prepare daily chart data
    const chartData = prepareChartData(stats.dailyData || {});

    return {
      success: true,
      data: {
        prediction,
        historical: {
          totalOrders: stats.totalOrders,
          totalRevenue: stats.totalRevenue,
          avgDailyOrders: Math.round(stats.avgDailyOrders * 10) / 10,
          avgOrderValue: Math.round(stats.avgOrderValue)
        },
        chartData
      }
    };
  } catch (error) {
    console.error('Sales prediction error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Prepare data for chart visualization
 * @param {Object} dailyData - Orders grouped by day
 * @returns {Object} - Chart.js compatible data
 */
function prepareChartData(dailyData) {
  const days = Object.keys(dailyData).sort();
  const last14Days = days.slice(-14);

  return {
    labels: last14Days.map(d => {
      const date = new Date(d);
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }),
    orders: last14Days.map(d => dailyData[d]?.count || 0),
    revenue: last14Days.map(d => dailyData[d]?.revenue || 0)
  };
}

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} - Dashboard data
 */
async function getDashboardStats() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Total orders this month
    const monthlyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Monthly revenue
    const revenueResult = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const monthlyRevenue = revenueResult[0]?.total || 0;

    // Pending deliveries
    const pendingDeliveries = await Order.countDocuments({
      status: { $in: ['Pending', 'Ready'] }
    });

    // Top selling products
    const topProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: '$productId', totalQuantity: { $sum: '$quantity' }, totalRevenue: { $sum: '$totalPrice' } } },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $project: { name: '$product.name', totalQuantity: 1, totalRevenue: 1 } }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('customerId', 'name')
      .populate('productId', 'name')
      .sort('-createdAt')
      .limit(5);

    return {
      success: true,
      data: {
        monthlyOrders,
        monthlyRevenue,
        pendingDeliveries,
        topProducts,
        recentOrders
      }
    };
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  getSalesPrediction,
  getDashboardStats,
  getOrdersForPeriod,
  calculateStatistics
};
