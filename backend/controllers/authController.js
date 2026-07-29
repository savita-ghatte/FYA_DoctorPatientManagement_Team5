const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });

  const options = {
    expires: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        patientId: user.patientId,
        doctorId: user.doctorId,
        staffId: user.staffId,
        profile: user.profile
      },
    });
};

exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, password, role, licenseNumber, departmentId } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role,
      licenseNumber,
      departmentId,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (role && user.role !== role) {
      return res.status(401).json({ success: false, message: 'Role mismatch' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    // Placeholder for forgot password
    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { email, fullName, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google email is required' });
    }

    const selectedRole = role || 'patient';
    let user = await User.findOne({ email });

    if (!user) {
      const bcrypt = require('bcryptjs');
      const randomPassword = await bcrypt.hash('GoogleSSO_' + Math.random(), 10);
      user = await User.create({
        fullName: fullName || email.split('@')[0],
        email: email.toLowerCase(),
        password: randomPassword,
        role: selectedRole,
        patientId: selectedRole === 'patient' ? `PAT-2024-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
        doctorId: selectedRole === 'doctor' ? `MDV-2024-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
        staffId: selectedRole === 'assistant' ? `MED-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
        profile: {
          initials: (fullName || email).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        }
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
