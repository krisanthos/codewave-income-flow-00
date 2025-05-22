
import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdraw', 'task_reward', 'daily_bonus'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  description: {
    type: String
  },
  accountDetails: {
    type: Object
  }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', TransactionSchema);

export default Transaction;
