interface WorkoutSet {
  setNumber: number;
  reps: number;
  weight: number;
}

interface StrengthWorkout {
  _id: string;
  date: string;
  sets: WorkoutSet[];
  exerciseId: string;
}

interface CardioWorkout {
  _id: string;
  date: string;
  distance: number;
  time: number;
  activityId: string;
}

export interface WeeklyMetrics {
  totalWeight: number;
  totalDistance: number;
  totalTime: number;
}

export interface DailyData {
  date: string;
  dayName: string;
  weight: number;
  distance: number;
  time: number;
}

// Get start of week (Monday) at midnight
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  const diff = (day === 0 ? -6 : 1) - day; // Days to subtract to get to Monday
  d.setDate(d.getDate() + diff);
  return d;
}

// Calculate total weight lifted from strength workouts
function calculateTotalWeight(workouts: StrengthWorkout[]): number {
  return workouts.reduce((total, workout) => {
    const workoutVolume = workout.sets.reduce((sum, set) => {
      return sum + (set.reps * set.weight);
    }, 0);
    return total + workoutVolume;
  }, 0);
}

// Calculate total distance from cardio workouts
function calculateTotalDistance(workouts: CardioWorkout[]): number {
  return workouts.reduce((total, workout) => total + workout.distance, 0);
}

// Calculate total time from cardio workouts
function calculateTotalTime(workouts: CardioWorkout[]): number {
  return workouts.reduce((total, workout) => total + workout.time, 0);
}

// Get weekly metrics and daily breakdown
export function getWeeklyData(
  strengthWorkouts: StrengthWorkout[],
  cardioWorkouts: CardioWorkout[]
): { metrics: WeeklyMetrics; dailyData: DailyData[] } {
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const dailyData: DailyData[] = [];

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Generate 7 days of data (Monday to Sunday)
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek.getTime());
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);

    const dateStr = date.toISOString().split('T')[0];

    const dayStrengthWorkouts = strengthWorkouts.filter(w => {
      const workoutDateStr = new Date(w.date).toISOString().split('T')[0];
      return workoutDateStr === dateStr;
    });

    const dayCardioWorkouts = cardioWorkouts.filter(w => {
      const workoutDateStr = new Date(w.date).toISOString().split('T')[0];
      return workoutDateStr === dateStr;
    });

    dailyData.push({
      date: dateStr,
      dayName: dayNames[i],
      weight: calculateTotalWeight(dayStrengthWorkouts),
      distance: calculateTotalDistance(dayCardioWorkouts),
      time: calculateTotalTime(dayCardioWorkouts)
    });
  }

  // Calculate weekly totals
  const metrics = {
    totalWeight: dailyData.reduce((sum, day) => sum + day.weight, 0),
    totalDistance: dailyData.reduce((sum, day) => sum + day.distance, 0),
    totalTime: dailyData.reduce((sum, day) => sum + day.time, 0)
  };

  return { metrics, dailyData };
}
