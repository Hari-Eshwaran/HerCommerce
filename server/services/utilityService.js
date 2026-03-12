/**
 * Utility service for common business operations
 */

// Calculate profit margin
exports.calculateMargin = (price, cost) => {
  if (!cost || cost === 0) return 100;
  return Math.round(((price - cost) / price) * 100);
};

// Calculate profit amount
exports.calculateProfit = (price, cost) => {
  return price - (cost || 0);
};

// Format currency
exports.formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Generate unique identifier
exports.generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
};

// Paginate results
exports.paginate = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      total: array.length,
      page: parseInt(page),
      pages: Math.ceil(array.length / limit),
      hasNext: endIndex < array.length,
      hasPrev: page > 1
    }
  };
};

// Date utilities
exports.dateUtils = {
  startOfDay: (date = new Date()) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  },
  
  endOfDay: (date = new Date()) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  },
  
  startOfMonth: (date = new Date()) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  },
  
  endOfMonth: (date = new Date()) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  },
  
  daysFromNow: (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  }
};

// Validate Indian phone number
exports.validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Validate email
exports.validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize string for search
exports.sanitizeSearch = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Calculate order totals
exports.calculateOrderTotal = (items, discount = 0, tax = 0, deliveryCharge = 0) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  return {
    subtotal,
    discount,
    tax,
    deliveryCharge,
    total: subtotal - discount + tax + deliveryCharge
  };
};
