// src/components/ChatHeader.tsx

import React from "react";
import { FiMenu, FiGlobe, FiBellOff, FiVolume2, FiUserX } from "react-icons/fi";
import { getLastActiveText } from "../components/chatUtils";
import type { User } from "../components/chatUtils";

interface ChatHeaderProps {
  selectedUser: User | null | undefined;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPreviewImage: (url: string | null) => void;
  onRevokeClick: () => void;
  onMuteClick: () => void;
  isMuted: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedUser,
  setIsSidebarOpen,
  setPreviewImage,
  onRevokeClick,
  onMuteClick,
  isMuted,
}) => {

  return (
    <div className="flex items-center justify-between px-4 p-3 md:p-4 bg-gray-700/85 backdrop-blur-md text-white shadow border-b border-white/10" style={{ boxSizing: "border-box" }}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="text-white hover:text-gray-300 md:hidden bg-inherit focus:outline-none"
          aria-label="Toggle sidebar"
        >
          <FiMenu/>
        </button>

        {selectedUser === undefined ? (
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-neutral-700 animate-pulse" />
            <div className="w-24 h-4 bg-neutral-700 rounded animate-pulse" />
          </div>
        ) : selectedUser ? (
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              {selectedUser.photoURL ? (
                <img
                  src={selectedUser.photoURL}
                  alt={`${selectedUser.displayName}'s profile`}
                  className="w-full h-full object-cover"
                  onClick={() => setPreviewImage(selectedUser.photoURL || null)}
                />
              ) : (
                <div className="w-full h-full bg-neutral-700 flex items-center justify-center font-bold">
                  {selectedUser.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="font-bold">{selectedUser.displayName}</h1>
              <p className="text-xs text-gray-300">{getLastActiveText(selectedUser.lastSeen)}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center">
              <FiGlobe size={20} />
            </div>
            <h1 className="font-semibold">Global Chat</h1>
          </div>
        )}
      </div>
      
      {/* Options Menu: Mute and Revoke */}
      <div className="relative">
          <div className="flex items-center gap-2">
            <button onClick={onMuteClick} title={isMuted ? "Unmute Chat" : "Mute Chat"} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                {isMuted ? <FiBellOff size={18}/> : <FiVolume2 size={18}/>}
            </button>
            {selectedUser && (
                <button onClick={onRevokeClick} title="Revoke Chat Access" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <FiUserX size={18} />
                </button>
            )}
          </div>
      </div>
    </div>
  );
};

export default ChatHeader;