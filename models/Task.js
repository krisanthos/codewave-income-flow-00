
import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  reward: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['ad_watch', 'social_media_like', 'survey', 'other'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Task = mongoose.model('Task', TaskSchema);

export default Task;
