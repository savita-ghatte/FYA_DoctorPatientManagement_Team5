const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    barcode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    testName: {
      type: String,
      required: true,
      trim: true,
    },

    testCategory: {
      type: String,
      enum: [
        'Blood Test',
        'Urine Test',
        'X-Ray',
        'MRI',
        'CT Scan',
        'Ultrasound',
        'ECG',
        'Other'
      ],
      default: 'Other',
    },

    collectionTime: {
      type: Date,
    },

    destination: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ['Pending', 'Collected', 'Processing', 'Dispatched', 'Completed', 'Rejected'],
      default: 'Pending',
    },

    sampleType: {
      type: String,
      enum: ['Blood', 'Urine', 'Saliva', 'Stool', 'Swab', 'Other'],
    },

    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    results: [
      {
        parameter: String,
        value: String,
        unit: String,
        referenceRange: String,
        remarks: String,
      },
    ],

    reportFile: {
      type: String, // PDF or image URL
    },

    notes: {
      type: String,
      trim: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    reportDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LabReport', labReportSchema);
