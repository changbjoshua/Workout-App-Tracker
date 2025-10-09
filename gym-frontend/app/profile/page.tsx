"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Dumbbell, User, LogOut, Heart, Menu, X, Camera, Trash2, ChevronDown } from "lucide-react";
import Image from "next/image";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      profileImage?: string;
    };
    update: (data: { name?: string; profileImage?: string }) => Promise<Session | null>;
  }
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Profile image state
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [imageSuccess, setImageSuccess] = useState("");

  // Profile dropdown state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setProfileImage(session.user.profileImage || null);
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = (session as { accessToken?: string })?.accessToken;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      // Update the session with new name
      await update({ name: data.user.name });

      setSuccess("Profile updated successfully!");
      setLoading(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);

    try {
      const token = (session as { accessToken?: string })?.accessToken;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Password change failed");
      }

      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordLoading(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setPasswordSuccess("");
      }, 3000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setPasswordError(errorMessage);
      setPasswordLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setImageError("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageError("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageError("");
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;

    setImageLoading(true);
    setImageError("");
    setImageSuccess("");

    try {
      const token = (session as { accessToken?: string })?.accessToken;
      const formData = new FormData();
      formData.append("image", imageFile);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile/image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setProfileImage(data.profileImage);
      setImageFile(null);
      setImagePreview(null);
      setImageSuccess("Profile image updated successfully!");

      // Update session with new profile image
      await update({ profileImage: data.profileImage });

      setTimeout(() => {
        setImageSuccess("");
      }, 3000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setImageError(errorMessage);
    } finally {
      setImageLoading(false);
    }
  };

  const handleImageDelete = async () => {
    if (!profileImage) return;

    if (!confirm("Are you sure you want to delete your profile image?")) {
      return;
    }

    setImageLoading(true);
    setImageError("");
    setImageSuccess("");

    try {
      const token = (session as { accessToken?: string })?.accessToken;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile/image`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setProfileImage(null);
      setImageSuccess("Profile image deleted successfully!");

      // Update session to remove profile image
      await update({ profileImage: null });

      setTimeout(() => {
        setImageSuccess("");
      }, 3000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setImageError(errorMessage);
    } finally {
      setImageLoading(false);
    }
  };

  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (status === "loading") {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="text-gray-900 text-lg font-semibold">Loading...</p>
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

      <nav className="bg-gray-800 shadow-sm relative z-10">
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
                className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/strength-training"
                className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                <Dumbbell className="w-4 h-4" />
                Strength
              </Link>
              <Link
                href="/cardio-training"
                className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
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
                  <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileDropdownOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-gray-700">
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium"
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
                className="w-full flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="px-4 py-6 sm:px-0">
          {/* Profile Image Section */}
          <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Profile Image
            </h2>

            {imageError && (
              <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded mb-4">
                {imageError}
              </div>
            )}
            {imageSuccess && (
              <div className="bg-green-900 border border-green-600 text-green-200 px-4 py-3 rounded mb-4">
                {imageSuccess}
              </div>
            )}

            <div className="flex flex-col items-center space-y-4">
              {/* Current or Preview Image */}
              <div className="relative">
                {imagePreview || profileImage ? (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500">
                    <Image
                      src={imagePreview || profileImage || ""}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center border-4 border-gray-600">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex flex-col items-center space-y-3 w-full max-w-md">
                {!imagePreview && (
                  <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition">
                    <Camera className="w-4 h-4" />
                    <span>Choose Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={imageLoading}
                    />
                  </label>
                )}

                {imagePreview && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleImageUpload}
                      disabled={imageLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {imageLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {imageLoading ? "Uploading..." : "Upload"}
                    </button>
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      disabled={imageLoading}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {profileImage && !imagePreview && (
                  <button
                    onClick={handleImageDelete}
                    disabled={imageLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {imageLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {imageLoading ? "Deleting..." : "Delete Image"}
                  </button>
                )}

                <p className="text-sm text-gray-400 text-center">
                  Max file size: 5MB. Supported formats: JPG, PNG, GIF
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Profile Settings
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-900 border border-green-600 text-green-200 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  disabled
                  value={email}
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-900 text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-gray-400">
                  Email cannot be changed
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Section */}
          <div className="bg-gray-800 rounded-lg shadow p-6 mt-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Change Password
            </h2>

            <form onSubmit={handlePasswordChange} className="space-y-6">
              {passwordError && (
                <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="bg-green-900 border border-green-600 text-green-200 px-4 py-3 rounded">
                  {passwordSuccess}
                </div>
              )}

              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-300"
                >
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-300"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                />
                <p className="mt-1 text-sm text-gray-400">
                  Minimum 6 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {passwordLoading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {passwordLoading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
