const express = require('express');
const authMiddleware = require('../middleware/auth');
const Workout = require('../models/Workout');
const Exercise = require('../models/Exercise');

const router = express.Router();

// Get all workouts for the user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { exerciseId, startDate, endDate } = req.query;
    const filter = { userId: req.user._id };

    if (exerciseId) filter.exerciseId = exerciseId;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const workouts = await Workout.find(filter)
      .populate('exerciseId', 'name category type')
      .sort({ date: -1 });

    res.json({ workouts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workouts', error: error.message });
  }
});

// Get workout history for a specific exercise
router.get('/exercise/:exerciseId/history', authMiddleware, async (req, res) => {
  try {
    const workouts = await Workout.find({
      exerciseId: req.params.exerciseId,
      userId: req.user._id
    })
      .sort({ date: -1 })
      .limit(10);

    res.json({ workouts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workout history', error: error.message });
  }
});

// Get workout progress (strength improvements)
router.get('/exercise/:exerciseId/progress', authMiddleware, async (req, res) => {
  try {
    const workouts = await Workout.find({
      exerciseId: req.params.exerciseId,
      userId: req.user._id
    })
      .sort({ date: 1 });

    if (workouts.length === 0) {
      return res.json({ progress: null, message: 'No workout data available' });
    }

    // Calculate progress metrics
    const first = workouts[0];
    const latest = workouts[workouts.length - 1];

    const firstMaxWeight = Math.max(...first.sets.map(s => s.weight));
    const latestMaxWeight = Math.max(...latest.sets.map(s => s.weight));

    const firstTotalVolume = first.sets.reduce((sum, s) => sum + (s.reps * s.weight), 0);
    const latestTotalVolume = latest.sets.reduce((sum, s) => sum + (s.reps * s.weight), 0);

    const progress = {
      totalWorkouts: workouts.length,
      firstWorkout: {
        date: first.date,
        maxWeight: firstMaxWeight,
        totalVolume: firstTotalVolume
      },
      latestWorkout: {
        date: latest.date,
        maxWeight: latestMaxWeight,
        totalVolume: latestTotalVolume
      },
      improvement: {
        weight: latestMaxWeight - firstMaxWeight,
        weightPercentage: ((latestMaxWeight - firstMaxWeight) / firstMaxWeight * 100).toFixed(2),
        volume: latestTotalVolume - firstTotalVolume,
        volumePercentage: ((latestTotalVolume - firstTotalVolume) / firstTotalVolume * 100).toFixed(2)
      }
    };

    res.json({ progress });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching progress', error: error.message });
  }
});

// Get single workout
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('exerciseId', 'name category type');

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json({ workout });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workout', error: error.message });
  }
});

// Log new workout
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { exerciseId, date, sets, notes, rpe } = req.body;

    // Verify exercise exists and belongs to user
    const exercise = await Exercise.findOne({ _id: exerciseId, userId: req.user._id });
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    const workout = new Workout({
      exerciseId,
      userId: req.user._id,
      date: date || Date.now(),
      sets,
      notes,
      rpe
    });

    await workout.save();
    await workout.populate('exerciseId', 'name category type');

    res.status(201).json({
      message: 'Workout logged successfully',
      workout
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging workout', error: error.message });
  }
});

// Update workout
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { date, sets, notes, rpe } = req.body;

    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { date, sets, notes, rpe },
      { new: true, runValidators: true }
    ).populate('exerciseId', 'name category type');

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json({
      message: 'Workout updated successfully',
      workout
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating workout', error: error.message });
  }
});

// Delete workout
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting workout', error: error.message });
  }
});

module.exports = router;
