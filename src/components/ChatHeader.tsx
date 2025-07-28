// src/components/ChatHeader.tsx

import React from "react";
import {
  FiMenu,
  FiGlobe,
  FiBellOff,
  FiVolume2,
  FiUserX,
  FiUserCheck,
} from "react-icons/fi";
import { getLastActiveText } from "../components/chatUtils";
import type { User } from "../components/chatUtils";

interface ChatHeaderProps {
  selectedUser: User | null | undefined;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPreviewImage: (url: string | null) => void;
  onRevokeClick: () => void;
  onGrantClick: () => void; // New prop
  isChatActive: boolean; // New prop
  onMuteClick: () => void;
  isMuted: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedUser,
  setIsSidebarOpen,
  setPreviewImage,
  onRevokeClick,
  onGrantClick,
  isChatActive,
  onMuteClick,
  isMuted,
}) => {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 md:p-4 bg-gray-700/85 backdrop-blur-md text-white shadow border-b border-white/10"
      style={{ boxSizing: "border-box" }}
    >
      <div
        className="flex items-center gap-2"
        style={{ boxSizing: "border-box" }}
      >
        <button
          onClick={(e) => {
            setIsSidebarOpen(true);
            e.currentTarget.style.border = "none";
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.border = "none";
          }}
          className="text-white hover:text-gray-300 md:hidden bg-inherit focus:outline-none p-2"
          style={{ boxSizing: "border-box" }}
          aria-label="Toggle sidebar"
        >
          <FiMenu />
        </button>

        {selectedUser === undefined ? (
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-neutral-700 animate-pulse" />
            <div className="w-24 h-4 bg-neutral-700 rounded animate-pulse" />
          </div>
        ) : selectedUser ? (
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer">
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
              <h1 className="font-bold truncate block text-[clamp(1rem,2vw,1.9rem)] w-[166px]">
                {selectedUser.displayName}
              </h1>
              <p className="text-xs text-gray-300">
                {getLastActiveText(selectedUser.lastSeen)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center">
              <FiGlobe size={20} />
            </div>
            <h1 className="font-semibold  text-[clamp(1rem,2vw,1.9rem)]">
              Global Chat
            </h1>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="flex items-center gap-1">
          <button
            onClick={onMuteClick}
            onMouseOver={(e) => {
              e.currentTarget.style.border = "none";
            }}
            title={isMuted ? "Unmute Chat" : "Mute Chat"}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            {isMuted ? <FiBellOff size={15} /> : <FiVolume2 size={15} />}
          </button>
          {selectedUser &&
            (isChatActive ? (
              <button
                onClick={onRevokeClick}
                onMouseOver={(e) => {
                  e.currentTarget.style.border = "none";
                }}
                title="Revoke Chat Access"
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <FiUserX size={15} className="text-red-400" />
              </button>
            ) : (
              <button
                onClick={onGrantClick}
                onMouseOver={(e) => {
                  e.currentTarget.style.border = "none";
                }}
                title="Grant Chat Access"
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <FiUserCheck size={15} className="text-green-400" />
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
