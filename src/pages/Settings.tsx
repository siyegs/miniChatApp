import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { FiArrowLeft, FiUpload } from "react-icons/fi";
import { updateUserDisplayName, uploadToImgBB } from "../components/chatUtils";

const Settings = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(
    auth.currentUser?.displayName || ""
  );
  const [photoURL, setPhotoURL] = useState(auth.currentUser?.photoURL || "");
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="min-h-screen w-screen flex justify-center items-center bg-gradient-to-br from-neutral-900 to-neutral-800">
      <div className="w-11/12">
        <button
          onClick={() => {navigate("/chat")}}
          onMouseOver={(e)=> e.currentTarget.style.border = "none"}
          className="flex items-center text-white mb-6 hover:text-gray-300 focus:border-none"
        >
          <FiArrowLeft className="mr-2" /> Back to Chat
        </button>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <h1 className="text-2xl font-bold text-neutral-900 mb-6">
            Account Settings
          </h1>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
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
        </div>
      </div>
    </div>
  );
};

export default Settings;
