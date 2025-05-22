
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  try {
    const { fullName, username, email, phoneNumber, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      fullName,
      username,
      email,
      phoneNumber,
      password
    });

    await user.save();

    // Create a registration payment transaction
    const transaction = new Transaction({
      user: user._id,
      type: 'deposit',
      amount: 2500, // Registration fee
      status: 'completed',
      description: 'Registration payment'
    });

    await transaction.save();

    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { adminPassword } = req.body;
    
    console.log('Received admin password:', adminPassword);
    console.log('Expected admin password from env:', process.env.ADMIN_PASSWORD);
    
    // Hardcode the password for testing to ensure it works
    const correctPassword = 'codewave2025';
    
    if (adminPassword !== correctPassword) {
      return res.status(400).json({ msg: 'Invalid admin password' });
    }

    // Find or create admin user
    let adminUser = await User.findOne({ isAdmin: true });
    
    if (!adminUser) {
      adminUser = new User({
        fullName: 'Admin',
        username: 'admin',
        email: 'admin@codewave.com',
        phoneNumber: '00000000000',
        password: 'adminSecurePassword',
        isAdmin: true
      });
      
      await adminUser.save();
    }

    const payload = {
      user: {
        id: adminUser.id,
        isAdmin: true
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
