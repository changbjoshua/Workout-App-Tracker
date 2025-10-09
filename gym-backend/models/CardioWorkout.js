const mongoose = require('mongoose');

const cardioWorkoutSchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CardioActivity',
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
  distance: {
    type: Number,
    required: true // in km
  },
  time: {
    type: Number,
    required: true // in minutes
  },
  pace: {
    type: Number // calculated automatically - speed in km/h
  },
  calories: {
    type: Number // estimated calories burned
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate pace before saving (speed in km/h)
cardioWorkoutSchema.pre('save', function(next) {
  if (this.distance && this.time) {
    this.pace = (this.distance / this.time) * 60; // km/h
  }
  next();
});

module.exports = mongoose.model('CardioWorkout', cardioWorkoutSchema);
