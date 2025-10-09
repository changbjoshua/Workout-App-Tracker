const express = require('express');
const authMiddleware = require('../middleware/auth');
const Exercise = require('../models/Exercise');

const router = express.Router();

// Get all exercises for the user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { type, category } = req.query;
    const filter = { userId: req.user._id };

    if (type) filter.type = type;
    if (category) filter.category = category;

    const exercises = await Exercise.find(filter).sort({ category: 1, name: 1 });

    res.json({ exercises });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exercises', error: error.message });
  }
});

// Get exercises grouped by category
router.get('/by-category', authMiddleware, async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { userId: req.user._id };

    if (type) filter.type = type;

    const exercises = await Exercise.find(filter).sort({ category: 1, name: 1 });

    // Group by category
    const grouped = exercises.reduce((acc, exercise) => {
      if (!acc[exercise.category]) {
        acc[exercise.category] = [];
      }
      acc[exercise.category].push(exercise);
      return acc;
    }, {});

    res.json({ exercises: grouped });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exercises', error: error.message });
  }
});

// Get single exercise
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const exercise = await Exercise.findOne({ _id: req.params.id, userId: req.user._id });

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.json({ exercise });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exercise', error: error.message });
  }
});

// Create new exercise
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, category, type, description } = req.body;

    const exercise = new Exercise({
      name,
      category,
      type: type || 'Strength',
      description,
      userId: req.user._id
    });

    await exercise.save();

    res.status(201).json({
      message: 'Exercise created successfully',
      exercise
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating exercise', error: error.message });
  }
});

// Update exercise
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, category, type, description } = req.body;

    const exercise = await Exercise.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name, category, type, description },
      { new: true, runValidators: true }
    );

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.json({
      message: 'Exercise updated successfully',
      exercise
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating exercise', error: error.message });
  }
});

// Delete exercise
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const exercise = await Exercise.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting exercise', error: error.message });
  }
});

module.exports = router;
