const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
  setNumber: {
    type: Number,
    required: true
  },
  reps: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true
  }
}, { _id: false });

const workoutSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  sets: [setSchema],
  notes: {
    type: String,
    trim: true
  },
  rpe: {
    type: Number,
    min: 1,
    max: 10
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Workout', workoutSchema);
