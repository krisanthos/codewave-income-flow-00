
const express = require('express');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const router = express.Router();

// Process daily interest for all users
router.post('/process-daily-interest', [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.find();
    let processed = 0;
    
    for (const user of users) {
      // Calculate interest based on balance
      // Each 10000 naira = 5% per day
      const interestRate = Math.floor(user.balance / 10000) * 0.05;
      const interestAmount = user.balance * interestRate;
      
      if (interestAmount > 0) {
        // Add interest to user balance
        user.balance += interestAmount;
        await user.save();
        
        // Create transaction record
        const transaction = new Transaction({
          user: user._id,
          type: 'daily_bonus',
          amount: interestAmount,
          status: 'completed',
          description: `Daily interest (${(interestRate * 100).toFixed(2)}%)`
        });
        
        await transaction.save();
        processed++;
      }
    }
    
    res.json({ msg: `Processed daily interest for ${processed} users` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Confirm payment transaction
router.post('/confirm-payment/:id', [auth, adminAuth], async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    
    // Only confirm pending deposits
    if (transaction.status !== 'pending' || transaction.type !== 'deposit') {
      return res.status(400).json({ msg: 'Cannot confirm this transaction' });
    }
    
    transaction.status = 'completed';
    await transaction.save();
    
    // Add amount to user balance
    const user = await User.findById(transaction.user);
    user.balance += transaction.amount;
    await user.save();
    
    res.json({ msg: 'Payment confirmed', transaction });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
