const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// GET all customers
router.get('/', customerController.getAll);

// GET customer stats
router.get('/stats', customerController.getStats);

// GET single customer
router.get('/:id', customerController.getById);

// POST create customer
router.post('/', customerController.create);

// PUT update customer
router.put('/:id', customerController.update);

// DELETE customer
router.delete('/:id', customerController.delete);

module.exports = router;
