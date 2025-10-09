const express = require('express');
const CardioActivity = require('../models/CardioActivity');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all cardio activities for a user
router.get('/', async (req, res) => {
  try {
    const activities = await CardioActivity.find({ userId: req.user.id }).sort({ name: 1 });
    res.json({ activities });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cardio activities', error: error.message });
  }
});

// Get a single cardio activity
router.get('/:id', async (req, res) => {
  try {
    const activity = await CardioActivity.findOne({ _id: req.params.id, userId: req.user.id });

    if (!activity) {
      return res.status(404).json({ message: 'Cardio activity not found' });
    }

    res.json({ activity });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cardio activity', error: error.message });
  }
});

// Create a new cardio activity
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    const activity = new CardioActivity({
      name,
      type: 'Cardio',
      description,
      userId: req.user.id
    });

    await activity.save();
    res.status(201).json({ message: 'Cardio activity created successfully', activity });
  } catch (error) {
    res.status(500).json({ message: 'Error creating cardio activity', error: error.message });
  }
});

// Update a cardio activity
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const activity = await CardioActivity.findOne({ _id: req.params.id, userId: req.user.id });

    if (!activity) {
      return res.status(404).json({ message: 'Cardio activity not found' });
    }

    activity.name = name;
    activity.description = description;
    await activity.save();

    res.json({ message: 'Cardio activity updated successfully', activity });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cardio activity', error: error.message });
  }
});

// Delete a cardio activity
router.delete('/:id', async (req, res) => {
  try {
    const activity = await CardioActivity.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!activity) {
      return res.status(404).json({ message: 'Cardio activity not found' });
    }

    res.json({ message: 'Cardio activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting cardio activity', error: error.message });
  }
});

module.exports = router;
