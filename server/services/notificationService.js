/**
 * Notification service for sending messages
 * Supports WhatsApp Business API, Email, and SMS (placeholders for integration)
 */

// Send WhatsApp message (placeholder - integrate with WhatsApp Business API)
exports.sendWhatsApp = async (phone, message) => {
  console.log(`[WhatsApp] To: ${phone}, Message: ${message}`);
  // TODO: Integrate with WhatsApp Business API
  return { success: true, channel: 'whatsapp' };
};

// Send email (placeholder - integrate with email service like SendGrid, Nodemailer)
exports.sendEmail = async (email, subject, body) => {
  console.log(`[Email] To: ${email}, Subject: ${subject}`);
  // TODO: Integrate with email service
  return { success: true, channel: 'email' };
};

// Send SMS (placeholder - integrate with SMS gateway)
exports.sendSMS = async (phone, message) => {
  console.log(`[SMS] To: ${phone}, Message: ${message}`);
  // TODO: Integrate with SMS gateway
  return { success: true, channel: 'sms' };
};

// Notification templates
exports.templates = {
  orderConfirmation: (order) => ({
    subject: `Order Confirmed - ${order.orderNumber}`,
    message: `Hi! Your order ${order.orderNumber} has been confirmed. We'll start working on it right away! Expected delivery: ${order.deliveryDate || 'To be confirmed'}. Thank you for your order!`
  }),
  
  orderReady: (order) => ({
    subject: `Order Ready - ${order.orderNumber}`,
    message: `Great news! Your order ${order.orderNumber} is ready for pickup/delivery. Please let us know a convenient time. Thank you!`
  }),
  
  orderDelivered: (order) => ({
    subject: `Order Delivered - ${order.orderNumber}`,
    message: `Your order ${order.orderNumber} has been delivered. We hope you love it! Please share your feedback. Thank you for choosing us!`
  }),
  
  paymentReminder: (order) => ({
    subject: `Payment Reminder - ${order.orderNumber}`,
    message: `Hi! This is a gentle reminder about the pending payment of ₹${order.total - order.amountPaid} for your order ${order.orderNumber}. Please contact us if you have any questions.`
  }),
  
  welcome: (customer) => ({
    subject: 'Welcome to our family!',
    message: `Hi ${customer.name}! Welcome to our family. We're so happy to have you. Feel free to reach out anytime with questions or to place an order. We're here to serve you!`
  })
};

// Send notification based on customer preference
exports.notify = async (customer, template, data) => {
  const notification = exports.templates[template](data);
  
  switch (customer.preferredContact) {
    case 'whatsapp':
      return exports.sendWhatsApp(customer.phone, notification.message);
    case 'email':
      return exports.sendEmail(customer.email, notification.subject, notification.message);
    case 'phone':
    default:
      return exports.sendSMS(customer.phone, notification.message);
  }
};
