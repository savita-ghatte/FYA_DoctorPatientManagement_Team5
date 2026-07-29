const mongoose = require('mongoose');

const billingInvoiceSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  services: String,
  totalAmount: Number,
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Insurance-Claimed'], default: 'Pending' },
  paymentMethod: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BillingInvoice', billingInvoiceSchema);
