const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Required for manual hashing if needed in future

// Load env variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Load models
const User = require('../models/User');
const Vital = require('../models/Vital');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const LabReport = require('../models/LabReport');
const Room = require('../models/Room');
const BillingInvoice = require('../models/BillingInvoice');

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      tlsAllowInvalidCertificates: true
    });
    console.log('Connected to MongoDB');

    console.log('Clearing old data...');
    await User.deleteMany({});
    await Vital.deleteMany({});
    await Prescription.deleteMany({});
    await Appointment.deleteMany({});
    await LabReport.deleteMany({});
    await Room.deleteMany({});
    await BillingInvoice.deleteMany({});

    console.log('Creating users...');
    
    // Creating Doctors
    const drKapoor = await User.create({
      fullName: 'Dr. Meera Kapoor',
      email: 'doctor@medivance.com',
      phone: '+919876543210',
      password: 'Password123!',
      role: 'doctor',
      licenseNumber: 'MED-894029-TX',
      doctorId: 'MDV-2024-0847',
      profile: {
        age: 42, gender: 'Female', department: 'Cardiology', specialty: 'Cardiology',
        qualification: 'MD, DM Cardiology', experience: '15+ Years',
        hospital: 'MediVance Central Hospital', fee: '₹1,200',
        opRoom: 'OPD Room 302', bio: 'Leading cardiologist specializing in interventional cardiology and heart failure management.',
        contact: '+91 98765 43210', initials: 'MK'
      }
    });

    const drGupta = await User.create({
      fullName: 'Dr. Rajesh Gupta',
      email: 'rajesh.gupta@medivance.com',
      phone: '+919876543211',
      password: 'Password123!',
      role: 'doctor',
      licenseNumber: 'MED-773210-TX',
      doctorId: 'MDV-2024-0912',
      profile: {
        age: 50, gender: 'Male', department: 'Orthopedics', specialty: 'Orthopedics',
        qualification: 'MS Ortho, Fellowship Sports Medicine', experience: '20+ Years',
        hospital: 'MediVance Central Hospital', fee: '₹800',
        opRoom: 'OPD Room 205', bio: 'Expert orthopedic surgeon with focus on sports injuries and joint replacement.',
        contact: '+91 98765 43211', initials: 'RG'
      }
    });

    const drSen = await User.create({
      fullName: 'Dr. Ananya Sen',
      email: 'ananya.sen@medivance.com',
      phone: '+919876543212',
      password: 'Password123!',
      role: 'doctor',
      licenseNumber: 'MED-556102-TX',
      doctorId: 'MDV-2024-1034',
      profile: {
        age: 38, gender: 'Female', department: 'Neurology', specialty: 'Neurology',
        qualification: 'MD, DM Neurology, Fellowship Epilepsy', experience: '12+ Years',
        hospital: 'MediVance Central Hospital', fee: '₹1,000',
        opRoom: 'OPD Room 410', bio: 'Renowned neurologist specializing in epilepsy management and neurodegenerative disorders.',
        contact: '+91 98765 43212', initials: 'AS'
      }
    });

    // Creating Patient
    const patientVaibhav = await User.create({
      fullName: 'Vaibhav Barwal',
      email: 'patient@medivance.com',
      phone: '+919123456789',
      password: 'Password123!',
      role: 'patient',
      patientId: 'PAT-2024-9921',
      profile: {
        age: 32, gender: 'Male', bloodGroup: 'O+', height: '178 cm', weight: '74 kg',
        allergies: ['Penicillin'], insurance: 'Star Health - Gold Plan',
        initials: 'VB'
      }
    });

    // Creating Assistant
    const assistantManthan = await User.create({
      fullName: 'Manthan Sakat',
      email: 'assistant@medivance.com',
      phone: '+919234567890',
      password: 'Password123!',
      role: 'assistant',
      departmentId: 'DEPT-CLINIC-402',
      staffId: 'MED-8842',
      profile: {
        age: 28, gender: 'Male', department: 'General OPD',
        certifications: ['ACLS', 'BLS', 'Certified Triage Nurse'],
        shift: '8:00 AM - 4:00 PM (Morning)', block: 'Block B', floor: 'Floor 3',
        initials: 'MS'
      }
    });

    // Create 7 additional temporary patient users
    const tempPatients = [];
    const patientNames = ['Rohit Sharma', 'Priya Nair', 'Amit Patel', 'Sunita Devi', 'Karan Singh', 'Neha Verma', 'Deepak Kumar'];
    for (let i = 0; i < patientNames.length; i++) {
      const p = await User.create({
        fullName: patientNames[i],
        email: `patient${i+1}@medivance.com`,
        phone: `+91900000000${i}`,
        password: 'Password123!',
        role: 'patient',
        patientId: `PAT-TEMP-00${i+1}`,
        profile: {
          age: 30 + i, gender: i % 2 === 0 ? 'Male' : 'Female',
          initials: patientNames[i].split(' ').map(n => n[0]).join('')
        }
      });
      tempPatients.push(p);
    }
    
    const allPatients = [patientVaibhav, ...tempPatients];

    console.log('Creating vitals...');
    // Vitals for Vaibhav (7 days)
    const vitalsData = [];
    for(let i=0; i<7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      
      vitalsData.push({
        patient: patientVaibhav._id,
        recordedBy: assistantManthan._id,
        heartRate: 72 + Math.floor(Math.random() * 5 - 2),
        bloodPressure: {
          systolic: 120 + Math.floor(Math.random() * 6 - 3),
          diastolic: 80 + Math.floor(Math.random() * 4 - 2)
        },
        temperature: 98.6 + (Math.random() * 0.4 - 0.2),
        oxygenSaturation: 99 - Math.floor(Math.random() * 2),
        bloodSugar: 98 + Math.floor(Math.random() * 10 - 5),
        timestamp: date
      });
    }
    await Vital.insertMany(vitalsData);

    console.log('Creating prescriptions...');
    await Prescription.create({
      patient: patientVaibhav._id,
      doctor: drKapoor._id,
      medicines: [
        { name: 'Multivitamin', dosage: '1 Tablet', frequency: 'Once daily', duration: '90 days', time: '8:00 AM', instructions: 'Take after breakfast' },
        { name: 'Amoxicillin 500mg', dosage: '1 Capsule', frequency: 'Twice daily', duration: '7 days', time: '9:00 AM, 9:00 PM', instructions: 'Take with food' },
        { name: 'Omega-3 Fish Oil', dosage: '1 Softgel', frequency: 'Once daily', duration: '60 days', time: '1:00 PM', instructions: 'Take with lunch' }
      ],
      diagnosis: 'Routine checkup - mild vitamin deficiency',
      notes: 'Follow up in 3 months'
    });

    console.log('Creating appointments...');
    // Appointments for today
    const appts = [
      { token: 'TKN-001', patientName: 'Vaibhav Barwal', time: '09:00 AM', status: 'Checked-In', pObj: allPatients[0], doctor: drKapoor },
      { token: 'TKN-002', patientName: 'Rohit Sharma', time: '09:30 AM', status: 'Scheduled', pObj: allPatients[1], doctor: drKapoor },
      { token: 'TKN-003', patientName: 'Priya Nair', time: '10:00 AM', status: 'Scheduled', pObj: allPatients[2], doctor: drKapoor },
      { token: 'TKN-004', patientName: 'Amit Patel', time: '10:30 AM', status: 'Scheduled', pObj: allPatients[3], doctor: drKapoor },
      { token: 'TKN-005', patientName: 'Sunita Devi', time: '11:00 AM', status: 'Scheduled', pObj: allPatients[4], doctor: drKapoor },
      { token: 'TKN-006', patientName: 'Karan Singh', time: '11:30 AM', status: 'Scheduled', pObj: allPatients[5], doctor: drKapoor },
      { token: 'TKN-007', patientName: 'Neha Verma', time: '12:00 PM', status: 'Scheduled', pObj: allPatients[6], doctor: drKapoor },
      { token: 'TKN-008', patientName: 'Deepak Kumar', time: '12:30 PM', status: 'Scheduled', pObj: allPatients[7], doctor: drKapoor }
    ];
    
    for (let a of appts) {
      await Appointment.create({
        tokenNumber: a.token,
        patient: a.pObj._id,
        doctor: a.doctor._id,
        specialty: 'Cardiology', // All with Dr. Kapoor
        time: a.time,
        status: a.status,
        date: new Date()
      });
    }

    // A few for Dr. Gupta and Dr. Sen
    await Appointment.create({ tokenNumber: 'TKN-101', patient: allPatients[1]._id, doctor: drGupta._id, specialty: 'Orthopedics', time: '10:00 AM', status: 'Scheduled', date: new Date() });
    await Appointment.create({ tokenNumber: 'TKN-201', patient: allPatients[2]._id, doctor: drSen._id, specialty: 'Neurology', time: '11:00 AM', status: 'Scheduled', date: new Date() });

    console.log('Creating lab reports...');
    const labs = [
      { reportId: 'BAR-20240301', patient: allPatients[0], testName: 'Complete Blood Count', time: '09:15 AM', lab: 'Hematology Lab', status: 'Dispatched' },
      { reportId: 'BAR-20240302', patient: allPatients[1], testName: 'Lipid Profile', time: '09:30 AM', lab: 'Biochemistry Lab', status: 'Pending' },
      { reportId: 'BAR-20240303', patient: allPatients[2], testName: 'Thyroid Panel', time: '10:00 AM', lab: 'Endocrine Lab', status: 'Pending' },
      { reportId: 'BAR-20240304', patient: allPatients[3], testName: 'Liver Function', time: '10:30 AM', lab: 'Biochemistry Lab', status: 'Pending' },
      { reportId: 'BAR-20240305', patient: allPatients[4], testName: 'Urinalysis', time: '11:00 AM', lab: 'Microbiology Lab', status: 'Completed' }
    ];
    for (let l of labs) {
      await LabReport.create({
        barcode: l.reportId,
        patient: l.patient._id,
        testCategory: l.testName,
        collectionTime: l.time,
        destination: l.lab,
        status: l.status,
        date: new Date()
      });
    }

    console.log('Creating rooms...');
    const rooms = [
      { roomNumber: 'OPD-301', block: 'Block A', floor: 'Floor 3', type: 'OPD', status: 'Occupied', assignedDoctor: drKapoor.fullName },
      { roomNumber: 'OPD-302', block: 'Block A', floor: 'Floor 3', type: 'OPD', status: 'Available' },
      { roomNumber: 'OPD-303', block: 'Block A', floor: 'Floor 3', type: 'OPD', status: 'Occupied', assignedDoctor: drGupta.fullName },
      { roomNumber: 'ICU-101', block: 'Block B', floor: 'Floor 1', type: 'ICU', status: 'Occupied' },
      { roomNumber: 'ICU-102', block: 'Block B', floor: 'Floor 1', type: 'ICU', status: 'Available' },
      { roomNumber: 'ICU-103', block: 'Block B', floor: 'Floor 1', type: 'ICU', status: 'Occupied' },
      { roomNumber: 'WARD-201', block: 'Block C', floor: 'Floor 2', type: 'Ward', status: 'Available' },
      { roomNumber: 'WARD-202', block: 'Block C', floor: 'Floor 2', type: 'Ward', status: 'Occupied' },
      { roomNumber: 'WARD-203', block: 'Block C', floor: 'Floor 2', type: 'Ward', status: 'Available' },
      { roomNumber: 'EMER-001', block: 'Block A', floor: 'Floor 1', type: 'Emergency', status: 'Available' },
      { roomNumber: 'LAB-401', block: 'Block B', floor: 'Floor 4', type: 'Lab', status: 'Available' },
      { roomNumber: 'PHAR-101', block: 'Block C', floor: 'Floor 1', type: 'Pharmacy', status: 'Available' }
    ];
    await Room.insertMany(rooms);

    console.log('Creating billing invoices...');
    const invoices = [
      { invoiceId: 'INV-2024-001', patient: allPatients[0], description: 'OPD Consultation + ECG', amount: 2500, status: 'Paid' },
      { invoiceId: 'INV-2024-002', patient: allPatients[1], description: 'OPD Consultation', amount: 800, status: 'Pending' },
      { invoiceId: 'INV-2024-003', patient: allPatients[2], description: 'OPD + Thyroid Panel', amount: 1800, status: 'Insurance-Claimed' },
      { invoiceId: 'INV-2024-004', patient: allPatients[3], description: 'OPD + Liver Function Test', amount: 2200, status: 'Pending' },
      { invoiceId: 'INV-2024-005', patient: allPatients[4], description: 'OPD + Urinalysis', amount: 1500, status: 'Paid' }
    ];
    for (let inv of invoices) {
      await BillingInvoice.create({
        invoiceId: inv.invoiceId,
        patient: inv.patient._id,
        services: inv.description,
        totalAmount: inv.amount,
        paymentStatus: inv.status,
        date: new Date()
      });
    }

    console.log(`\nSeed complete! 12 users, 10 appointments, 7 vitals created\n`);
    console.log(`Test Credentials:`);
    console.log(`Doctor:    doctor@medivance.com / Password123!`);
    console.log(`Patient:   patient@medivance.com / Password123!`);
    console.log(`Assistant: assistant@medivance.com / Password123!`);

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
