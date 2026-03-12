const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for queries
salesSchema.index({ orderId: 1 });
salesSchema.index({ date: -1 });

module.exports = mongoose.model('Sales', salesSchema);
