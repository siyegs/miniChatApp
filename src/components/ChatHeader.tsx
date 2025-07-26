import React from "react";
import { FiMenu, FiGlobe } from "react-icons/fi";
import { getLastActiveText } from "../components/chatUtils";
import type { User } from "../components/chatUtils";

interface ChatHeaderProps {
  selectedUser: User | null | undefined; // undefined for loading
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPreviewImage: (url: string | null) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedUser,
  setIsSidebarOpen,
  setPreviewImage,
}) => {
  // Try to load cached user data if selectedUser is undefined but savedChatId exists
  const savedChatId = localStorage.getItem("selectedChat");
  let cachedUser: User | null = null;
  if (selectedUser === undefined && savedChatId && savedChatId !== "global") {
    try {
      const cached = localStorage.getItem(`user_${savedChatId}`);
      if (cached) {
        cachedUser = JSON.parse(cached) as User;
        console.log("Using cached user for header:", cachedUser.displayName);
      }
    } catch (error) {
      console.error("Error parsing cached user:", error);
    }
  }

  return (
    <div className="flex items-center justify-between px-0 p-3 md:p-5 bg-gray-700/85 backdrop-blur-md text-neutral-900 shadow border-none"  style={{ boxSizing: "border-box" }}>
      <div className="flex items-center">
        <button
          onClick={(e) => {setIsSidebarOpen((prev) => !prev); e.currentTarget.style.outline = "none"}}
          onMouseOver={(e) => (e.currentTarget.style.border = "none")}
          className="text-neutral-700 hover:text-neutral-900 md:hidden bg-inherit focus:none"
          aria-label="Toggle sidebar"
        >
          <FiMenu className="text-white"/>
        </button>

        {selectedUser === undefined && cachedUser ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center cursor-pointer">
              {cachedUser.photoURL ? (
                <img
                  src={cachedUser.photoURL}
                  alt={`${cachedUser.displayName}'s profile`}
                  className="w-full h-full object-cover"
                  onClick={() => setPreviewImage(cachedUser?.photoURL || null)}
                />
              ) : (
                <div className="w-full h-full bg-neutral-700 flex items-center justify-center text-white">
                  {cachedUser.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-[clamp(0.7rem,4.3vw,1.5rem)] font-bold cursor-pointer hover:opacity-80 text-white">
                {cachedUser.displayName}
              </h1>
              <p className="text-[clamp(0.5rem,3vw,1rem)] text-[whitesmoke]">
                {getLastActiveText(cachedUser.lastSeen)}
              </p>
            </div>
          </div>
        ) : selectedUser === undefined ? (
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center text-white">
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
            </div>
            <h1 className="text-lg font-semibold text-white">Loading...</h1>
          </div>
        ) : selectedUser ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center cursor-pointer">
              {selectedUser.photoURL ? (
                <img
                  src={selectedUser.photoURL}
                  alt={`${selectedUser.displayName}'s profile`}
                  className="w-full h-full object-cover"
                  onClick={() => setPreviewImage(selectedUser.photoURL || null)}
                />
              ) : (
                <div className="w-full h-full bg-neutral-700 flex items-center justify-center text-white">
                  {selectedUser.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-[clamp(0.7rem,4.3vw,1.5rem)] font-bold cursor-pointer hover:opacity-80 text-white">
                {selectedUser.displayName}
              </h1>
              <p className="text-[clamp(0.5rem,3vw,1rem)] text-[whitesmoke]">
                {getLastActiveText(selectedUser.lastSeen)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center text-white">
              <FiGlobe size={20} />
            </div>
            <h1 className="text-lg font-semibold text-white">Global Chat</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;