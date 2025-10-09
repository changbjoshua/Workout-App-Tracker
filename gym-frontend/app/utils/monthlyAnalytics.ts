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

export interface MonthlyMetrics {
  totalWeight: number;
  totalDistance: number;
  totalTime: number;
}

export interface WeeklyData {
  weekLabel: string;
  weight: number;
  distance: number;
  time: number;
}

// Get start of month at midnight
function getStartOfMonth(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
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

// Get monthly metrics and weekly breakdown
export function getMonthlyData(
  strengthWorkouts: StrengthWorkout[],
  cardioWorkouts: CardioWorkout[]
): { metrics: MonthlyMetrics; weeklyData: WeeklyData[] } {
  const now = new Date();
  const startOfMonth = getStartOfMonth(now);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // Group data by week
  const weeklyData: WeeklyData[] = [];
  let weekNumber = 1;

  for (let dayOffset = 0; dayOffset < daysInMonth; dayOffset += 7) {
    const weekStart = new Date(startOfMonth.getTime());
    weekStart.setDate(startOfMonth.getDate() + dayOffset);

    const weekEnd = new Date(weekStart.getTime());
    weekEnd.setDate(weekStart.getDate() + 6);

    // Don't go beyond current date or end of month
    if (weekEnd > now) {
      weekEnd.setTime(now.getTime());
    }
    if (weekEnd.getDate() > daysInMonth) {
      weekEnd.setDate(daysInMonth);
    }

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    // Filter workouts for this week
    const weekStrengthWorkouts = strengthWorkouts.filter(w => {
      const workoutDateStr = new Date(w.date).toISOString().split('T')[0];
      return workoutDateStr >= weekStartStr && workoutDateStr <= weekEndStr;
    });

    const weekCardioWorkouts = cardioWorkouts.filter(w => {
      const workoutDateStr = new Date(w.date).toISOString().split('T')[0];
      return workoutDateStr >= weekStartStr && workoutDateStr <= weekEndStr;
    });

    weeklyData.push({
      weekLabel: `Week ${weekNumber}`,
      weight: calculateTotalWeight(weekStrengthWorkouts),
      distance: calculateTotalDistance(weekCardioWorkouts),
      time: calculateTotalTime(weekCardioWorkouts)
    });

    weekNumber++;

    // Stop if we've reached current date
    if (weekEnd >= now) break;
  }

  // Calculate monthly totals
  const metrics = {
    totalWeight: weeklyData.reduce((sum, week) => sum + week.weight, 0),
    totalDistance: weeklyData.reduce((sum, week) => sum + week.distance, 0),
    totalTime: weeklyData.reduce((sum, week) => sum + week.time, 0)
  };

  return { metrics, weeklyData };
}
