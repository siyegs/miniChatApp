import React, { useState } from "react";
import { auth } from "../firebase";
import { uploadToImgBB, updateUserDisplayName } from "./chatUtils";
import { FiUpload } from "react-icons/fi";

const PersonalInfo = () => {
  const [displayName, setDisplayName] = useState(
    auth.currentUser?.displayName || ""
  );
  const [photoURL, setPhotoURL] = useState(auth.currentUser?.photoURL || "");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileInput, setFileInput] = useState<File | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (fileInput) {
        const url = await uploadToImgBB(
          fileInput,
          import.meta.env.VITE_IMGBB_API_KEY
        );
        setPhotoURL(url);
        await updateUserDisplayName(displayName, url);
      } else {
        await updateUserDisplayName(displayName, photoURL);
      }
      setError(null);
      setTimeout(() => setSuccess(null), 1200);
    } catch (error) {
      setError("Failed to update profile.");
      setSuccess(null);
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setFileInput(file);
      try {
        const url = await uploadToImgBB(
          file,
          import.meta.env.VITE_IMGBB_API_KEY
        );
        setPhotoURL(url);
        setError(null);
        setTimeout(() => setSuccess(null), 1200);
      } catch (error) {
        setError("Failed to upload photo.");
        setSuccess(null);
        console.error("Failed to upload photo:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 py-8 px-7">
      <div className="text-center mb-4">
        <p className="text-neutral-600 text-sm font-medium">Email</p>
        <p className="text-neutral-800 text-base font-semibold">
          {auth.currentUser?.email || "No email available"}
        </p>
      </div>
      <div className="relative group">
        <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-neutral-200 to-neutral-300 border-4 border-neutral-100 shadow-lg flex items-center justify-center">
          {photoURL ? (
            <img
              src={photoURL}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-700 text-white text-4xl font-bold">
              {displayName.charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </div>
        <label className="absolute bottom-2 right-2 bg-neutral-900/90 border-2 border-white rounded-full p-2 cursor-pointer shadow-lg hover:bg-neutral-800 transition-colors duration-200 group-hover:scale-110">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <span className="text-white text-lg">
            <FiUpload />
          </span>
        </label>
      </div>
      <span className="text-neutral-500 text-sm mt-2">Profile Photo</span>
      <form
        onSubmit={handleUpdateProfile}
        className="space-y-6 max-w-md mx-auto w-full"
        autoComplete="off"
      >
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-600 bg-neutral-50 text-neutral-900 text-base transition"
            placeholder="Enter your display name"
            maxLength={32}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          onMouseOver={(e) => {
            e.currentTarget.style.border = "none";
          }}
          className="w-fit box-border flex items-center justify-center gap-2 bg-gradient-to-r from-neutral-900 to-neutral-700 text-white py-2.5 rounded-lg font-semibold shadow-md hover:from-neutral-800 hover:to-neutral-600 transition disabled:opacity-60 disabled:cursor-not-allowed text-[clamp(13px,3vw,23px)]"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Saving...
            </span>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
      {(error || success) && (
        <div className="max-w-md mx-auto w-full">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm mb-2 animate-fade-in">
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-sm mb-2 animate-fade-in">
              <span>{success}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalInfo;
