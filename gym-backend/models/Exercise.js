const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exercise name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Biceps', 'Triceps', 'Back', 'Wrists', 'Chest', 'Shoulders', 'Legs'],
  },
  type: {
    type: String,
    required: [true, 'Exercise type is required'],
    enum: ['Strength', 'Cardio'],
    default: 'Strength'
  },
  description: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Exercise', exerciseSchema);
