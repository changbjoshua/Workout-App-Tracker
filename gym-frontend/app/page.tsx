"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dumbbell } from "lucide-react";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/gym-theme.jpg')" }}
      ></div>

      {status === "loading" && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            <p className="text-gray-900 text-lg font-semibold">Loading...</p>
          </div>
        </div>
      )}

      <div className="text-center text-white space-y-6 px-4 relative z-10">
        <div className="flex flex-col items-center gap-4">
          <Dumbbell className="w-24 h-24" />
          <h1 className="text-6xl font-bold">Gym App</h1>
        </div>
        <p className="text-xl">
          Track your fitness journey and achieve your goals
        </p>
        <div className="space-x-4 mt-8">
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-block bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 hover:border-gray-800 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
