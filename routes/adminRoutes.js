
import express from 'express';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Task from '../models/Task.js';

const router = express.Router();

// Get all users
router.get('/users', [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get user by ID with all transactions
router.get('/users/:id', [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const transactions = await Transaction.find({ user: req.params.id });
    
    res.json({
      user,
      transactions
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get all transactions
router.get('/transactions', [auth, adminAuth], async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('user', 'fullName username email');
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update transaction status
router.put('/transactions/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { status } = req.body;
    
    let transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    
    transaction.status = status;
    await transaction.save();
    
    // If completing a deposit, add to user balance
    if (status === 'completed' && transaction.type === 'deposit') {
      const user = await User.findById(transaction.user);
      user.balance += transaction.amount;
      await user.save();
    }
    
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create new task
router.post('/tasks', [auth, adminAuth], async (req, res) => {
  try {
    const { title, description, reward, type } = req.body;
    
    const task = new Task({
      title,
      description,
      reward,
      type
    });
    
    await task.save();
    
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get total balance of all users
router.get('/statistics', [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.find();
    const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    
    res.json({
      totalBalance,
      totalUsers,
      totalTransactions
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
