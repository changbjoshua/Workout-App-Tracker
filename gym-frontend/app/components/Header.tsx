"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Dumbbell, Heart, Menu, X, User, LogOut, ChevronDown } from "lucide-react";

interface HeaderProps {
  currentPage?: string;
}

export default function Header({ currentPage }: HeaderProps) {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const profileImage = (session?.user as { profileImage?: string })?.profileImage;

  return (
    <nav className="bg-gray-800 shadow-sm relative z-50">
      <div className="px-4">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <Dumbbell className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold text-white">Gym App</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === "dashboard"
                  ? "text-white bg-gray-700"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/strength-training"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === "strength"
                  ? "text-white bg-gray-700"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              Strength
            </Link>
            <Link
              href="/cardio-training"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === "cardio"
                  ? "text-white bg-gray-700"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Heart className="w-4 h-4" />
              Cardio
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition"
              >
                {profileImage ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500">
                    <Image
                      src={profileImage}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-blue-500">
                    {getInitials(session?.user?.name || "User")}
                  </div>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-gray-300 transition-transform ${
                    profileDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[100]"
                    onClick={() => setProfileDropdownOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-[110] border border-gray-700">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        signOut({ callbackUrl: "/login" });
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button - Profile Image */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            {profileImage ? (
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500">
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-blue-500">
                {getInitials(session?.user?.name || "User")}
              </div>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/dashboard"
              className="block text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/strength-training"
              className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Dumbbell className="w-4 h-4" />
              Strength
            </Link>
            <Link
              href="/cardio-training"
              className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Heart className="w-4 h-4" />
              Cardio
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                signOut({ callbackUrl: "/login" });
              }}
              className="w-full flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
