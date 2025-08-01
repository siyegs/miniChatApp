// src/components/ChatHeader.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  FiMenu,
  FiGlobe,
  FiBellOff,
  FiVolume2,
  FiUserX,
  FiUserCheck,
} from 'react-icons/fi';
import { getLastActiveText } from '../components/chatUtils';
import type { User } from '../components/chatUtils';

interface ChatHeaderProps {
  selectedUser: User | null | undefined;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPreviewImage: (url: string | null) => void;
  onRevokeClick: () => void;
  onGrantClick: () => void;
  isChatActive: boolean;
  onMuteClick: () => void;
  isMuted: boolean;
  isRevokedByCurrentUser: boolean;
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
  isRevokedByCurrentUser,
}) => {
  const [triggerGrantClick, setTriggerGrantClick] = useState<boolean>(false);

  const handleGrantClick = useCallback(() => {
    onGrantClick();
    setTriggerGrantClick(true);
  }, [onGrantClick]);

  // Effect to handle auto-click after 1 second
  useEffect(() => {
    if (triggerGrantClick) {
      const timer = setTimeout(() => {
        onGrantClick();
        setTriggerGrantClick(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [triggerGrantClick, onGrantClick]);

  return (
    <div
      className="flex items-center justify-between px-3 py-3 md:p-4 bg-gray-700/85 backdrop-blur-md text-white shadow border-b border-white/10"
      style={{ boxSizing: 'border-box' }}
    >
      <div className="flex items-center gap-1">
        <button
          onClick={() => setIsSidebarOpen(true)}
          onMouseOver={(e) => (e.currentTarget.style.border = 'none')}
          className="text-white hover:text-gray-300 md:hidden bg-inherit focus:outline-none p-2"
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
              <h1 className="font-bold text-[clamp(15px,3vw,32px)]">
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
            <h1 className="font-semibold text-[clamp(15px,3vw,23px)]">
              Global Chat
            </h1>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="flex items-center gap-2">
          <button
            onClick={onMuteClick}
            title={isMuted ? 'Unmute Chat' : 'Mute Chat'}
            className="p-2 rounded-full hover:bg-white/10 transition-colors hover:border-purple-700"
          >
            {isMuted ? <FiBellOff size={15} /> : <FiVolume2 size={15} />}
          </button>
          {selectedUser &&
            (isChatActive ? (
              <button
                onClick={onRevokeClick}
                title="Revoke Chat Access"
                className="p-2 rounded-full hover:bg-white/10 transition-colors hover:border-purple-700"
              >
                <FiUserX size={15} className="text-red-400" />
              </button>
            ) : (
              // Grant Chat Access button with auto-click
              isRevokedByCurrentUser && (
                <button
                  onClick={handleGrantClick}
                  title="Grant Chat Access"
                  className="p-2 rounded-full hover:bg-white/10 transition-colors hover:border-purple-700"
                >
                  <FiUserCheck size={15} className="text-green-400" />
                </button>
              )
            ))}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;