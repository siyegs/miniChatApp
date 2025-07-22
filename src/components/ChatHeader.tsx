import React from "react";
import { FiMenu } from "react-icons/fi";
import { getLastActiveText } from "../components/chatUtils";
import type { User } from "../components/chatUtils";

interface ChatHeaderProps {
  selectedUser: User | null;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ selectedUser, setIsSidebarOpen }) => (
  <div className="flex items-center justify-between px-0 p-3 md:p-5 bg-white/90 backdrop-blur-md text-neutral-900 shadow border-b border-neutral-200">
    <div className="flex items-center">
      <button
        onClick={() => setIsSidebarOpen(prev => !prev)}
        className="text-neutral-700 hover:text-neutral-900 md:hidden mr-2 bg-inherit"
        style={{ border: "2px solid inherit", boxSizing: "border-box" }}
        aria-label="Toggle sidebar"
      >
        <FiMenu />
      </button>
      {selectedUser ? (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold">
            {selectedUser.photoURL ? (
              <img
                src={selectedUser.photoURL}
                alt={`${selectedUser.displayName}'s profile`}
                className="w-9 h-9 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none"; // Hide broken image
                  const nextSibling = e.currentTarget.nextSibling as HTMLElement | null;
                  if (nextSibling) {
                    nextSibling.style.display = "flex"; // Show fallback
                  }
                }}
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center">
                {selectedUser.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-[clamp(0.7rem,4.3vw,1.5rem)] font-bold text-neutral-900">
              {selectedUser.displayName}
            </h1>
            <p className="text-[clamp(0.5rem,3vw,1rem)] text-neutral-500">
              {getLastActiveText(selectedUser.lastSeen)}
            </p>
          </div>
        </div>
      ) : (
        <h1 className="text-lg font-semibold text-neutral-900">Global Chat</h1>
      )}
    </div>
  </div>
);

export default ChatHeader;