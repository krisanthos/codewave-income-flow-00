
import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Task from '../models/Task.js';

const router = express.Router();

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get user's transactions
router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get available tasks
router.get('/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ isActive: true });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Complete a task
router.post('/complete-task/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    
    // Add task reward to user balance
    const user = await User.findById(req.user.id);
    user.balance += task.reward;
    await user.save();
    
    // Create transaction record
    const transaction = new Transaction({
      user: req.user.id,
      type: 'task_reward',
      amount: task.reward,
      status: 'completed',
      description: `Reward for completing task: ${task.title}`
    });
    
    await transaction.save();
    
    res.json({ msg: 'Task completed successfully', balance: user.balance });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Withdraw request
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount, accountDetails } = req.body;
    const user = await User.findById(req.user.id);
    
    // Check withdrawal threshold
    if (amount < 50000) {
      return res.status(400).json({ msg: 'Minimum withdrawal amount is 50,000 Naira' });
    }
    
    // Check if user has sufficient balance
    if (user.balance < amount) {
      return res.status(400).json({ msg: 'Insufficient balance' });
    }
    
    // Create withdraw transaction
    const transaction = new Transaction({
      user: req.user.id,
      type: 'withdraw',
      amount: amount,
      status: 'pending',
      accountDetails,
      description: 'Withdrawal request'
    });
    
    await transaction.save();
    
    // Update user balance
    user.balance -= amount;
    await user.save();
    
    res.json({ msg: 'Withdrawal request submitted', transaction });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Deposit request
router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    
    // Create deposit transaction
    const transaction = new Transaction({
      user: req.user.id,
      type: 'deposit',
      amount: amount,
      status: 'pending',
      description: `Deposit via ${paymentMethod}`
    });
    
    await transaction.save();
    
    // In a real app, you would integrate with payment gateway here
    // For demo purposes, we'll just mark it as completed
    
    res.json({ 
      msg: 'Deposit initiated', 
      transaction,
      paymentInfo: {
        reference: `DEP-${Date.now()}`,
        paymentLink: 'https://fakepaymentlink.com'
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
