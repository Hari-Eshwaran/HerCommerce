const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// Get all orders
exports.getAll = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('customerId', 'name phone')
      .populate('productId', 'name price')
      .sort('-createdAt');
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single order by ID
exports.getById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name phone address')
      .populate('productId', 'name price category');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create order
exports.create = async (req, res) => {
  try {
    const { customerId, productId, quantity, totalPrice, orderDate, deliveryDate } = req.body;
    
    // Validate required fields
    if (!customerId || !productId || !quantity || !totalPrice) {
      return res.status(400).json({ 
        success: false, 
        message: 'customerId, productId, quantity, and totalPrice are required' 
      });
    }
    
    // Validate customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(400).json({ success: false, message: 'Customer not found' });
    }
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ success: false, message: 'Product not found' });
    }
    
    const order = new Order({
      customerId,
      productId,
      quantity,
      totalPrice,
      orderDate: orderDate || new Date(),
      deliveryDate,
      status: 'Pending'
    });
    
    await order.save();

    // Decrement product stock
    await Product.findByIdAndUpdate(productId, { $inc: { stock: -quantity } });

    // Increment customer totalOrders
    await Customer.findByIdAndUpdate(customerId, { $inc: { totalOrders: 1 } });
    
    // Populate and return
    await order.populate('customerId', 'name phone');
    await order.populate('productId', 'name price');
    
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update order
exports.update = async (req, res) => {
  try {
    const { quantity, totalPrice, deliveryDate, status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { quantity, totalPrice, deliveryDate, status },
      { new: true, runValidators: true }
    )
      .populate('customerId', 'name phone')
      .populate('productId', 'name price');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update order status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['Pending', 'Ready', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status must be Pending, Ready, or Delivered' 
      });
    }

    const existing = await Order.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // When order is first marked Delivered, add totalPrice to customer totalSpent
    if (status === 'Delivered' && existing.status !== 'Delivered') {
      await Customer.findByIdAndUpdate(existing.customerId, {
        $inc: { totalSpent: existing.totalPrice }
      });
    }
    // If reverting from Delivered, subtract from totalSpent
    if (status !== 'Delivered' && existing.status === 'Delivered') {
      await Customer.findByIdAndUpdate(existing.customerId, {
        $inc: { totalSpent: -existing.totalPrice }
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('customerId', 'name phone')
      .populate('productId', 'name price');
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete order
exports.delete = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Restore product stock
    await Product.findByIdAndUpdate(order.productId, { $inc: { stock: order.quantity } });

    // Decrement customer totalOrders
    await Customer.findByIdAndUpdate(order.customerId, { $inc: { totalOrders: -1 } });

    // If order was Delivered, subtract from customer totalSpent
    if (order.status === 'Delivered') {
      await Customer.findByIdAndUpdate(order.customerId, { $inc: { totalSpent: -order.totalPrice } });
    }

    await order.deleteOne();
    
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};