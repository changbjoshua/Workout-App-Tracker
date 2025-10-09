require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const exerciseRoutes = require('./routes/exercise');
const workoutRoutes = require('./routes/workout');
const cardioRoutes = require('./routes/cardio');
const cardioActivityRoutes = require('./routes/cardioActivity');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Gym Backend API is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/cardio', cardioRoutes);
app.use('/api/cardio-activities', cardioActivityRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});