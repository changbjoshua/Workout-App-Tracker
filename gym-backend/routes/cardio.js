const express = require('express');
const CardioWorkout = require('../models/CardioWorkout');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all cardio workouts for a user (with filters)
router.get('/', async (req, res) => {
  try {
    const { activityId, startDate, endDate } = req.query;
    const filter = { userId: req.user.id };

    if (activityId) {
      filter.activityId = activityId;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const workouts = await CardioWorkout.find(filter).sort({ date: -1 });
    res.json({ workouts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cardio workouts', error: error.message });
  }
});

// Get workout history for a specific activity
router.get('/activity/:activityId/history', async (req, res) => {
  try {
    const { activityId } = req.params;
    const workouts = await CardioWorkout.find({
      userId: req.user.id,
      activityId
    }).sort({ date: -1 }).limit(10);

    res.json({ workouts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workout history', error: error.message });
  }
});

// Get progress statistics for a specific activity
router.get('/activity/:activityId/progress', async (req, res) => {
  try {
    const { activityId } = req.params;
    const workouts = await CardioWorkout.find({
      userId: req.user.id,
      activityId
    }).sort({ date: 1 });

    if (workouts.length === 0) {
      return res.json({ progress: null });
    }

    const firstWorkout = workouts[0];
    const latestWorkout = workouts[workouts.length - 1];

    const totalDistance = workouts.reduce((sum, w) => sum + w.distance, 0);
    const totalTime = workouts.reduce((sum, w) => sum + w.time, 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);

    // Calculate pace improvement
    const paceImprovement = firstWorkout.pace - latestWorkout.pace;
    const paceImprovementPercentage = ((paceImprovement / firstWorkout.pace) * 100).toFixed(2);

    // Calculate average distance and time
    const avgDistance = (totalDistance / workouts.length).toFixed(2);
    const avgTime = (totalTime / workouts.length).toFixed(2);

    const progress = {
      totalWorkouts: workouts.length,
      totalDistance: totalDistance.toFixed(2),
      totalTime: totalTime.toFixed(2),
      totalCalories: totalCalories.toFixed(0),
      averageDistance: avgDistance,
      averageTime: avgTime,
      improvement: {
        pace: paceImprovement.toFixed(2),
        pacePercentage: paceImprovementPercentage,
        firstPace: firstWorkout.pace.toFixed(2),
        latestPace: latestWorkout.pace.toFixed(2)
      }
    };

    res.json({ progress });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating progress', error: error.message });
  }
});

// Create a new cardio workout
router.post('/', async (req, res) => {
  try {
    const { activityId, date, distance, time, calories, notes } = req.body;

    const workout = new CardioWorkout({
      activityId,
      userId: req.user.id,
      date,
      distance,
      time,
      calories,
      notes
    });

    await workout.save();
    res.status(201).json({ message: 'Cardio workout logged successfully', workout });
  } catch (error) {
    res.status(500).json({ message: 'Error logging cardio workout', error: error.message });
  }
});

// Update a cardio workout
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { activityId, date, distance, time, calories, notes } = req.body;

    const workout = await CardioWorkout.findOne({ _id: id, userId: req.user.id });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    workout.activityId = activityId;
    workout.date = date;
    workout.distance = distance;
    workout.time = time;
    workout.calories = calories;
    workout.notes = notes;

    await workout.save();
    res.json({ message: 'Workout updated successfully', workout });
  } catch (error) {
    res.status(500).json({ message: 'Error updating workout', error: error.message });
  }
});

// Delete a cardio workout
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const workout = await CardioWorkout.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting workout', error: error.message });
  }
});

module.exports = router;
