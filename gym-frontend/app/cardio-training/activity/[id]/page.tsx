"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, TrendingUp, Loader2, Edit2, Trash2 } from "lucide-react";
import Header from "../../../components/Header";

interface CardioActivity {
  _id: string;
  name: string;
  description: string;
  type: string;
}

interface Workout {
  _id: string;
  date: string;
  distance: number;
  time: number;
  pace?: number;
  calories?: number;
  notes?: string;
}

interface Progress {
  totalWorkouts: number;
  totalDistance: string;
  totalTime: string;
  totalCalories: string;
  improvement: {
    pace: string;
    pacePercentage: string;
  };
}

export default function CardioActivityDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const activityId = params?.id as string;

  const [activity, setActivity] = useState<CardioActivity | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logLoading, setLogLoading] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [deletingWorkoutId, setDeletingWorkoutId] = useState<string | null>(null);

  const [workoutData, setWorkoutData] = useState({
    date: new Date().toISOString().split('T')[0],
    distance: 0,
    time: 0,
    calories: 0,
    notes: ""
  });

  const fetchData = useCallback(async () => {
    try {
      const token = (session as {accessToken?: string})?.accessToken;

      // Fetch activity details
      const activityRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cardio-activities/${activityId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const activityData = await activityRes.json();
      setActivity(activityData.activity);

      // Fetch workout history
      const workoutsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cardio/activity/${activityId}/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const workoutsData = await workoutsRes.json();
      setWorkouts(workoutsData.workouts || []);

      // Fetch progress
      const progressRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cardio/activity/${activityId}/progress`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const progressData = await progressRes.json();
      setProgress(progressData.progress);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  }, [session, activityId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && activityId) {
      fetchData();
    }
  }, [status, router, activityId, fetchData]);

  const handleLogWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogLoading(true);

    try {
      const token = (session as {accessToken?: string})?.accessToken;
      const url = editingWorkout
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/cardio/${editingWorkout._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/cardio`;

      const res = await fetch(url, {
        method: editingWorkout ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          activityId,
          ...workoutData
        }),
      });

      if (res.ok) {
        setShowLogForm(false);
        setEditingWorkout(null);
        setWorkoutData({
          date: new Date().toISOString().split('T')[0],
          distance: 0,
          time: 0,
          calories: 0,
          notes: ""
        });
        fetchData();
      }
    } catch (error) {
      console.error("Error logging workout:", error);
    } finally {
      setLogLoading(false);
    }
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setWorkoutData({
      date: new Date(workout.date).toISOString().split('T')[0],
      distance: workout.distance,
      time: workout.time,
      calories: workout.calories || 0,
      notes: workout.notes || ""
    });
    setShowLogForm(true);
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm("Are you sure you want to delete this workout?")) {
      return;
    }

    setDeletingWorkoutId(workoutId);
    try {
      const token = (session as {accessToken?: string})?.accessToken;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cardio/${workoutId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting workout:", error);
    } finally {
      setDeletingWorkoutId(null);
    }
  };

  const handleCancelEdit = () => {
    setShowLogForm(false);
    setEditingWorkout(null);
    setWorkoutData({
      date: new Date().toISOString().split('T')[0],
      distance: 0,
      time: 0,
      calories: 0,
      notes: ""
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="text-white text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || !activity) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20" style={{ backgroundImage: "url('/other-gym.jpg')" }}></div>

      <Header currentPage="cardio" />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="px-4 py-6 sm:px-0">
          {/* Activity Header */}
          <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white">{activity.name}</h2>
                <p className="text-gray-300 mt-1">
                  {activity.description || `Track your ${activity.name.toLowerCase()} workouts`}
                </p>
              </div>
              <button
                onClick={() => setShowLogForm(!showLogForm)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Log Workout
              </button>
            </div>
          </div>

          {/* Progress Stats */}
          {progress && (
            <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="text-xl font-bold text-white">Progress</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-300">Total Workouts</p>
                  <p className="text-2xl font-bold text-white">{progress.totalWorkouts}</p>
                </div>
                <div className="border border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-300">Total Distance</p>
                  <p className="text-2xl font-bold text-white">{progress.totalDistance} km</p>
                </div>
                <div className="border border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-300">Total Time</p>
                  <p className="text-2xl font-bold text-white">{progress.totalTime} min</p>
                </div>
                <div className="border border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-300">Pace Improvement</p>
                  <p className="text-2xl font-bold text-green-600">{progress.improvement.pacePercentage}%</p>
                  <p className="text-sm text-gray-400">{progress.improvement.pace} km/h</p>
                </div>
              </div>
            </div>
          )}

          {/* Log Workout Form */}
          {showLogForm && (
            <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">
                {editingWorkout ? "Edit Workout" : "Log New Workout"}
              </h3>
              <form onSubmit={handleLogWorkout} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Date</label>
                  <input
                    type="date"
                    value={workoutData.date}
                    onChange={(e) => setWorkoutData({ ...workoutData, date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Distance (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={workoutData.distance || ''}
                      onChange={(e) => setWorkoutData({ ...workoutData, distance: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                      placeholder="5.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">Time (minutes)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={workoutData.time || ''}
                      onChange={(e) => setWorkoutData({ ...workoutData, time: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Calories (optional)</label>
                  <input
                    type="number"
                    value={workoutData.calories || ''}
                    onChange={(e) => setWorkoutData({ ...workoutData, calories: parseInt(e.target.value) || 0 })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                    placeholder="250"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Notes</label>
                  <textarea
                    value={workoutData.notes}
                    onChange={(e) => setWorkoutData({ ...workoutData, notes: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                    rows={3}
                    placeholder="How did it go?"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={logLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {logLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {logLoading
                      ? (editingWorkout ? "Updating..." : "Logging...")
                      : (editingWorkout ? "Update Workout" : "Log Workout")}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Workout History */}
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-white mb-4">Workout History</h3>
            {workouts.length > 0 ? (
              <div className="space-y-4">
                {workouts.map((workout) => (
                  <div key={workout._id} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-white">
                          {new Date(workout.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-300 mt-1">
                          {workout.distance} km in {workout.time} minutes
                        </p>
                        <p className="text-sm text-gray-400">
                          Pace: {workout.pace?.toFixed(2)} km/h
                        </p>
                        {workout.calories && (
                          <p className="text-sm text-gray-400">
                            Calories: {workout.calories}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditWorkout(workout)}
                          className="text-blue-400 hover:text-blue-300 p-1 cursor-pointer"
                          title="Edit workout"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWorkout(workout._id)}
                          disabled={deletingWorkoutId === workout._id}
                          className="text-red-600 hover:text-red-700 p-1 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                          title="Delete workout"
                        >
                          {deletingWorkoutId === workout._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    {workout.notes && (
                      <p className="text-sm text-gray-300 mt-2 italic">&quot;{workout.notes}&quot;</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No workouts logged yet. Start tracking your progress!</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
