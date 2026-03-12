const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// GET all orders (supports ?status query param)
router.get('/', orderController.getAll);

// GET single order by ID
router.get('/:id', orderController.getById);

// POST create order
router.post('/', orderController.create);

// PUT update order
router.put('/:id', orderController.update);

// PATCH update order status (Pending/Ready/Delivered)
router.patch('/:id/status', orderController.updateStatus);

// DELETE order
router.delete('/:id', orderController.delete);

module.exports = router;
