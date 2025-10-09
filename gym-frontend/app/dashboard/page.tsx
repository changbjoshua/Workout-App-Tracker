"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Dumbbell, Heart } from "lucide-react";
import Header from "../components/Header";
import WeeklyProgressChart from "../components/WeeklyProgressChart";
import MonthlyProgressChart from "../components/MonthlyProgressChart";
import { getWeeklyData } from "../utils/weeklyAnalytics";
import { getMonthlyData } from "../utils/monthlyAnalytics";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [strengthWorkouts, setStrengthWorkouts] = useState([]);
  const [cardioWorkouts, setCardioWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkoutData = useCallback(async () => {
    try {
      const token = (session as {accessToken?: string})?.accessToken;

      // Fetch all strength workouts
      const strengthRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/workouts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const strengthData = await strengthRes.json();
      setStrengthWorkouts(strengthData.workouts || []);

      // Fetch all cardio workouts
      const cardioRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cardio`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const cardioData = await cardioRes.json();
      setCardioWorkouts(cardioData.workouts || []);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching workout data:", error);
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchWorkoutData();
    }
  }, [status, router, fetchWorkoutData]);

  // Calculate weekly analytics
  const { metrics: weeklyMetrics, dailyData } = getWeeklyData(strengthWorkouts, cardioWorkouts);

  // Calculate monthly analytics
  const { metrics: monthlyMetrics, weeklyData } = getMonthlyData(strengthWorkouts, cardioWorkouts);

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
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: "url('/other-gym.jpg')" }}
      ></div>

      <Header currentPage="dashboard" />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              Welcome, {session?.user?.name || "User"}!
            </h2>
            <p className="text-gray-300">
              This is your personal dashboard. You can track your workouts and manage your fitness journey here.
            </p>
          </div>

          {/* Training Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
            {/* Strength Training Section */}
            <Link href="/strength-training">
              <div className="bg-gray-800 rounded-lg shadow hover:shadow-lg transition cursor-pointer p-6 border-2 border-transparent hover:border-blue-500">
                <div className="flex items-center mb-4">
                  <Dumbbell className="w-8 h-8 text-blue-400 mr-3" />
                  <h3 className="text-2xl font-bold text-white">Strength Training</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Track your strength exercises by muscle groups
                </p>
                <div className="text-sm text-gray-400">
                  Categories: Biceps, Triceps, Back, Chest, Shoulders, Legs, Wrists
                </div>
              </div>
            </Link>

            {/* Cardio Training Section */}
            <Link href="/cardio-training">
              <div className="bg-gray-800 rounded-lg shadow hover:shadow-lg transition cursor-pointer p-6 border-2 border-transparent hover:border-red-500">
                <div className="flex items-center mb-4">
                  <Heart className="w-8 h-8 text-red-500 mr-3" />
                  <h3 className="text-2xl font-bold text-white">Cardio Training</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Log your cardio workouts and endurance activities
                </p>
                <div className="text-sm text-gray-400">
                  Running, Cycling, Swimming, and more
                </div>
              </div>
            </Link>
          </div>

          {/* Analytics Charts */}
          <div className="space-y-6">
            <WeeklyProgressChart metrics={weeklyMetrics} dailyData={dailyData} />
            <MonthlyProgressChart metrics={monthlyMetrics} weeklyData={weeklyData} />
          </div>
        </div>
      </main>
    </div>
  );
}
