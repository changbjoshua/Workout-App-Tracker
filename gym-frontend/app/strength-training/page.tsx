"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Dumbbell } from "lucide-react";
import Header from "../components/Header";

const CATEGORIES = ["Biceps", "Triceps", "Back", "Wrists", "Chest", "Shoulders", "Legs"];

interface Exercise {
  _id: string;
  name: string;
  category: string;
  description?: string;
}

export default function StrengthTrainingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [exercises, setExercises] = useState<Record<string, Exercise[]>>({});
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: "", category: "Biceps", description: "" });

  const fetchExercises = useCallback(async () => {
    try {
      const token = (session as {accessToken?: string})?.accessToken;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exercises/by-category?type=Strength`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setExercises(data.exercises || {});
      setLoading(false);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchExercises();
    }
  }, [status, router, fetchExercises]);

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = (session as {accessToken?: string})?.accessToken;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exercises`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newExercise, type: "Strength" }),
      });

      if (res.ok) {
        setNewExercise({ name: "", category: "Biceps", description: "" });
        setShowAddForm(false);
        fetchExercises();
      }
    } catch (error) {
      console.error("Error adding exercise:", error);
    }
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
      <Header currentPage="strength" />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Exercise Categories</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Add Exercise
            </button>
          </div>

          {showAddForm && (
            <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-white">Add New Exercise</h3>
              <form onSubmit={handleAddExercise} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Exercise Name</label>
                  <input
                    type="text"
                    required
                    value={newExercise.name}
                    onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                    placeholder="e.g., Bench Press"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Category</label>
                  <select
                    value={newExercise.category}
                    onChange={(e) => setNewExercise({ ...newExercise, category: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Description (Optional)</label>
                  <textarea
                    value={newExercise.description}
                    onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Exercise
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-6">
            {CATEGORIES.map((category) => (
              <div key={category} className="bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-white mb-4">{category}</h3>
                {exercises[category] && exercises[category].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exercises[category].map((exercise: Exercise) => (
                      <Link
                        key={exercise._id}
                        href={`/strength-training/exercise/${exercise._id}`}
                        className="border border-gray-700 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition"
                      >
                        <h4 className="font-semibold text-white">{exercise.name}</h4>
                        {exercise.description && (
                          <p className="text-sm text-gray-300 mt-1">{exercise.description}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No exercises added yet for this category.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
