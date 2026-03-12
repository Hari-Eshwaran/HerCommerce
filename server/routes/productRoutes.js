const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET all products (supports ?search and ?category query params)
router.get('/', productController.getAll);

// GET single product by ID
router.get('/:id', productController.getById);

// POST create product
router.post('/', productController.create);

// PUT update product
router.put('/:id', productController.update);

// DELETE product
router.delete('/:id', productController.delete);

module.exports = router;
