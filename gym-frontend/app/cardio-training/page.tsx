"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Heart } from "lucide-react";
import Header from "../components/Header";

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
  activityId: string;
}

export default function CardioTrainingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activities, setActivities] = useState<CardioActivity[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivity, setNewActivity] = useState({ name: "", description: "" });
  const [addLoading, setAddLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const token = (session as {accessToken?: string})?.accessToken;

      // Fetch activities
      const activitiesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cardio-activities`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const activitiesData = await activitiesRes.json();
      setActivities(activitiesData.activities || []);

      // Fetch all workouts
      const workoutsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cardio`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const workoutsData = await workoutsRes.json();
      setWorkouts(workoutsData.workouts || []);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, router, fetchData]);

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);

    try {
      const token = (session as {accessToken?: string})?.accessToken;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cardio-activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newActivity),
      });

      if (res.ok) {
        setShowAddForm(false);
        setNewActivity({ name: "", description: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Error adding activity:", error);
    } finally {
      setAddLoading(false);
    }
  };

  const getRecentWorkoutsForActivity = (activityId: string) => {
    return workouts
      .filter(w => w.activityId === activityId)
      .slice(0, 3);
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

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20" style={{ backgroundImage: "url('/other-gym.jpg')" }}></div>

      <Header currentPage="cardio" />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Cardio Activities</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Add Activity
            </button>
          </div>

          {/* Add Activity Form */}
          {showAddForm && (
            <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Add New Activity</h3>
              <form onSubmit={handleAddActivity} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Activity Name</label>
                  <input
                    type="text"
                    value={newActivity.name}
                    onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                    placeholder="e.g., Swimming"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Description</label>
                  <input
                    type="text"
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                    placeholder="e.g., Pool or open water swimming"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewActivity({ name: "", description: "" });
                    }}
                    className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addLoading ? "Adding..." : "Add Activity"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-6">
            {activities.map((activity) => {
              const recentWorkouts = getRecentWorkoutsForActivity(activity._id);
              return (
                <Link
                  key={activity._id}
                  href={`/cardio-training/activity/${activity._id}`}
                  className="block bg-gray-800 rounded-lg shadow p-6 border-2 border-transparent hover:border-blue-500 transition cursor-pointer"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white">{activity.name}</h3>
                    {activity.description && (
                      <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
                    )}
                  </div>
                  {recentWorkouts.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentWorkouts.map((workout) => (
                          <div
                            key={workout._id}
                            className="border border-gray-700 rounded-lg p-4"
                          >
                            <p className="font-semibold text-white">{new Date(workout.date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-300 mt-1">
                              Distance: {workout.distance} km
                            </p>
                            <p className="text-sm text-gray-300">
                              Time: {workout.time} min
                            </p>
                            <p className="text-sm text-gray-400">
                              Pace: {workout.pace?.toFixed(2)} km/h
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium">
                        View all {activity.name} workouts →
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-400 italic">No workouts logged yet. Click to log your first workout!</p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
