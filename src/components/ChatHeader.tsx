import React from "react";
import { FiMenu, FiGlobe } from "react-icons/fi";
import { getLastActiveText } from "../components/chatUtils";
// import { auth } from "../firebase";
import type { User } from "../components/chatUtils";

interface ChatHeaderProps {
  selectedUser: User | null;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedUser,
  setIsSidebarOpen,
}) => {
  // const currentUser = auth.currentUser;

  return (
    <div className="flex items-center justify-between px-0 p-3 md:p-5 bg-white/90 backdrop-blur-md text-neutral-900 shadow border-b border-neutral-200">
      <div className="flex items-center">
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="text-neutral-700 hover:text-neutral-900 md:hidden bg-inherit hover:border-inherit"
          aria-label="Toggle sidebar"
        >
          <FiMenu />
        </button>

        {selectedUser ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
              {selectedUser.photoURL ? (
                <img
                  src={selectedUser.photoURL}
                  alt={`${selectedUser.displayName}'s profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-neutral-700 flex items-center justify-center text-white">
                  {selectedUser.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-[clamp(0.7rem,4.3vw,1.5rem)] font-bold">
                {selectedUser.displayName}
              </h1>
              <p className="text-[clamp(0.5rem,3vw,1rem)] text-neutral-500">
                {getLastActiveText(selectedUser.lastSeen)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center text-white">
              <FiGlobe size={20} />
            </div>
            <h1 className="text-lg font-semibold">Global Chat</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
