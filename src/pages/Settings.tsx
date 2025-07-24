import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  FiArrowLeft,
  FiUpload,
  FiLogOut,
  FiTrash2,
} from "react-icons/fi";
import {
  updateUserDisplayName,
  uploadToImgBB,
  signOutUser,
  deleteUserAccount,
  updateUserEmail,
  updateUserPassword,
} from "../components/chatUtils";

const Settings = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(
    auth.currentUser?.displayName || ""
  );
  const [photoURL, setPhotoURL] = useState(auth.currentUser?.photoURL || "");
  const [isLoading, setIsLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateUserDisplayName(displayName);
      navigate("/chat");
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        const url = await uploadToImgBB(
          file,
          import.meta.env.VITE_IMGBB_API_KEY
        );
        setPhotoURL(url);
      } catch (error) {
        console.error("Failed to upload photo:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!currentPassword || !newEmail) {
      setError("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      await updateUserEmail(currentPassword, newEmail);
      setSuccess("Email updated successfully");
      setNewEmail("");
      setCurrentPassword("");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!currentPassword || !newPassword) {
      setError("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      await updateUserPassword(currentPassword, newPassword);
      setSuccess("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        await deleteUserAccount();
        navigate("/");
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen w-screen flex justify-center items-center bg-gradient-to-br from-neutral-900 to-neutral-800">
      <div className="w-11/12 max-w-2xl">
        <button
          onClick={() => navigate("/chat")}
          className="flex items-center text-white mb-6 hover:text-gray-300"
        >
          <FiArrowLeft className="mr-2" /> Back to Chat
        </button>

        <div className="bg-white rounded-lg shadow-xl p-6 space-y-8">
          <h1 className="text-2xl font-bold text-neutral-900">
            Account Settings
          </h1>

          {/* Profile Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-200">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-700 text-white text-2xl">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-neutral-800 rounded-full p-2 cursor-pointer hover:bg-neutral-700">
                <FiUpload className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
                placeholder="Enter your display name"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-neutral-800 text-white py-2 rounded-md hover:bg-neutral-700 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>

          {/* Email Update Section - Only show for email/password users */}
          {auth.currentUser?.providerData[0]?.providerId === "password" && (
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Update Email</h2>
              <form onSubmit={handleEmailUpdate} className="space-y-4">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="New Email"
                  className="w-full px-4 py-2 border rounded"
                />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password"
                  className="w-full px-4 py-2 border rounded"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-neutral-800 text-white py-2 rounded"
                >
                  Update Email
                </button>
              </form>
            </div>
          )}

          {/* Password Update Section - Only show for email/password users */}
          {auth.currentUser?.providerData[0]?.providerId === "password" && (
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Update Password</h2>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password"
                  className="w-full px-4 py-2 border rounded"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full px-4 py-2 border rounded"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-neutral-800 text-white py-2 rounded"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>
          )}

          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded">
              {success}
            </div>
          )}

          {/* Account Actions */}
          <div className="border-t pt-6 space-y-4">
            <button
              onClick={() => signOutUser(navigate)}
              className="w-full flex items-center justify-center gap-2 bg-neutral-800 text-white py-2 rounded hover:bg-neutral-700"
            >
              <FiLogOut /> Sign Out
            </button>
            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded hover:bg-red-700"
            >
              <FiTrash2 /> Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
