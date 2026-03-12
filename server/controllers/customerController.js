const Customer = require('../models/Customer');

// Get all customers
exports.getAll = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const customers = await Customer.find(query).sort('-createdAt');
    
    res.json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single customer by ID
exports.getById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create customer
exports.create = async (req, res) => {
  try {
    const { name, phone, address, notes, createdBy } = req.body;
    
    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and phone are required' 
      });
    }
    
    const customer = new Customer({
      name,
      phone,
      address,
      notes,
      createdBy
    });
    
    await customer.save();
    
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update customer
exports.update = async (req, res) => {
  try {
    const { name, phone, address, notes } = req.body;
    
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, phone, address, notes },
      { new: true, runValidators: true }
    );
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete customer
exports.delete = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get customer stats
exports.getStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const recentCustomers = await Customer.find()
      .sort('-createdAt')
      .limit(5);
    
    res.json({
      success: true,
      data: {
        totalCustomers,
        recentCustomers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
