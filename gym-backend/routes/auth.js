const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Exercise = require('../models/Exercise');
const CardioActivity = require('../models/CardioActivity');
const commonExercises = require('../seeds/commonExercises');
const commonCardioActivities = require('../seeds/commonCardioActivities');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Create common exercises for the new user
    const exercisesToCreate = [];
    for (const [category, exercises] of Object.entries(commonExercises)) {
      for (const exercise of exercises) {
        exercisesToCreate.push({
          name: exercise.name,
          category: category,
          type: 'Strength',
          description: exercise.description,
          userId: user._id
        });
      }
    }

    // Bulk insert exercises
    await Exercise.insertMany(exercisesToCreate);

    // Create common cardio activities for the new user
    const cardioActivitiesToCreate = commonCardioActivities.map(activity => ({
      name: activity.name,
      type: 'Cardio',
      description: activity.description,
      userId: user._id
    }));

    await CardioActivity.insertMany(cardioActivitiesToCreate);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

module.exports = router;