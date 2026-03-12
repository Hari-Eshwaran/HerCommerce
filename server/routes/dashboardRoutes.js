const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const salesPredictionService = require('../ai/salesPredictionService');

// GET dashboard stats
router.get('/stats', dashboardController.getStats);

// GET sales data
router.get('/sales', dashboardController.getSalesData);

// GET sales by category
router.get('/sales-by-category', dashboardController.getSalesByCategory);

// GET recent orders
router.get('/recent-orders', dashboardController.getRecentOrders);

// GET top customers
router.get('/top-customers', dashboardController.getTopCustomers);

// GET top products
router.get('/top-products', dashboardController.getTopProducts);

// GET today's summary
router.get('/today', dashboardController.getTodaySummary);

// GET sales prediction
router.get('/prediction', async (req, res) => {
  try {
    const result = await salesPredictionService.getSalesPrediction();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET dashboard overview (combined stats)
router.get('/overview', async (req, res) => {
  try {
    const result = await salesPredictionService.getDashboardStats();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
