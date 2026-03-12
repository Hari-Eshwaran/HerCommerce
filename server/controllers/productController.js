const Product = require('../models/Product');

// Get all products
exports.getAll = async (req, res) => {
  try {
    const { search, category } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    const products = await Product.find(query).sort('-createdAt');
    
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single product by ID
exports.getById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create product
exports.create = async (req, res) => {
  try {
    const { name, description, price, cost, stock, unit, image, category, createdBy } = req.body;
    
    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, price, and category are required' 
      });
    }
    
    const product = new Product({
      name,
      description,
      price,
      cost,
      stock,
      unit,
      image,
      category,
      createdBy
    });
    
    await product.save();
    
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update product
exports.update = async (req, res) => {
  try {
    const { name, description, price, cost, stock, unit, image, category } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, cost, stock, unit, image, category },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete product
exports.delete = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};