
const mongoose = require('mongoose');

const billingInvoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    services: [
      {
        serviceName: {
          type: String,
          required: true,
          trim: true,
        },
        category: {
          type: String,
          enum: [
            'Consultation',
            'Lab Test',
            'Radiology',
            'Medicine',
            'Surgery',
            'Room Charges',
            'Other',
          ],
          default: 'Other',
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        total: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: [
        'Pending',
        'Partially Paid',
        'Paid',
        'Insurance Claimed',
        'Refunded',
      ],
      default: 'Pending',
    },

    paymentMethod: {
      type: String,
      enum: [
        'Cash',
        'Card',
        'UPI',
        'Net Banking',
        'Insurance',
        'Cheque',
      ],
    },

    insuranceProvider: {
      type: String,
      trim: true,
    },

    transactionId: {
      type: String,
      trim: true,
    },

    dueDate: {
      type: Date,
    },

    notes: {
      type: String,
      trim: true,
    },

    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BillingInvoice', billingInvoiceSchema);
