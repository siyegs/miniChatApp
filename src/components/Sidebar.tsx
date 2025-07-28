// src/components/Sidebar.tsx

import React, { useState, useRef, useEffect } from "react";
import { FiSettings, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import type { User, ChatRequest } from "../components/chatUtils";
import { auth } from "../firebase";
import { canUsersChat } from "./chatUtils";
import { FaDoorOpen } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faClock, faTimes } from "@fortawesome/free-solid-svg-icons";

interface SidebarProps {
  users: User[];
  usersLoading: boolean;
  selectedUser: User | null | undefined;
  setSelectedUser: (user: User | null) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  displayName: string;
  photoURL: string;
  setPreviewImage: (url: string | null) => void;
  userSearch: string;
  setUserSearch: (search: string) => void;
  handleSignOut: () => void;
  chatRequests: ChatRequest[];
  onSendChatRequest: (userId: string) => void;
  unreadMessages: { [userId: string]: boolean };
}

const Sidebar: React.FC<SidebarProps> = ({
  users,
  usersLoading,
  selectedUser,
  setSelectedUser,
  isSidebarOpen,
  setIsSidebarOpen,
  displayName,
  photoURL,
  setPreviewImage,
  userSearch,
  setUserSearch,
  chatRequests,
  onSendChatRequest,
  handleSignOut,
  unreadMessages,
}) => {
  const navigate = useNavigate();

  const handleUserClick = async (user: User) => {
    if (!user.displayName || !auth.currentUser) return;
    if (user.isDeleted) return;

    const canChat = await canUsersChat(auth.currentUser.uid, user.id);
    if (canChat) {
      setSelectedUser(user);
      setIsSidebarOpen(false);
    } else {
      const requestStatus = getRequestStatus(user.id);
      if (requestStatus === 'pending') {
        alert(`Your chat request to ${user.displayName} is still pending.`);
      } else {
        alert(`You must send a chat request and have it accepted to chat with ${user.displayName}.`);
      }
    }
  };

  const handleSendRequest = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    onSendChatRequest(userId);
  };

  const getRequestStatus = (userId: string) => {
    if (!auth.currentUser) return null;
    const request = chatRequests.find(req => 
        req.participants.includes(auth.currentUser!.uid) && req.participants.includes(userId)
    );
    return request?.status || null;
  };

  const [showAccountModal, setShowAccountModal] = useState(false);
  const accountModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountModalRef.current && !accountModalRef.current.contains(event.target as Node)) {
        setShowAccountModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } max-md:w-[65%] w-80 bg-gradient-to-b from-[#7a5fa7]/80 to-[#5a3f87]/70 backdrop-blur-md shadow-xl text-white flex flex-col border-r border-white/10`}
    >
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20 flex-shrink-0">
            {photoURL ? (
              <img src={photoURL} alt="Profile" className="w-full h-full object-cover" onClick={() => setPreviewImage(photoURL)} />
            ) : (
              <FiUser className="w-5 h-5" />
            )}
          </div>
          <div
            className="font-semibold relative cursor-pointer"
            onClick={() => setShowAccountModal(v => !v)}
            ref={accountModalRef}
          >
            {displayName}
            {showAccountModal && (
              <div className="absolute left-0 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-48 animate-fade-in">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => navigate("/settings")}
                >
                  <FiSettings /> Settings
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                  onClick={handleSignOut}
                >
                  <FaDoorOpen /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-3 no-scrollbar">
        <div className="px-4 pb-2">
          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full px-3 py-1.5 border bg-white/10 placeholder:text-white/60 text-white border-white/10 rounded-lg focus:outline-none focus:border-white/30"
            disabled={usersLoading}
          />
        </div>

        <ul>
          <li
            key="global"
            onClick={() => setSelectedUser(null)}
            className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors rounded-lg mx-2 mb-1 ${
              !selectedUser ? "bg-white/20" : "hover:bg-white/10 text-white/80"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold flex-shrink-0">
              {unreadMessages['global'] ? <div className="w-3 h-3 bg-purple-500 rounded-full" /> : '#'}
            </div>
            <span className="font-semibold">Global Chat</span>
          </li>
          <hr className="border-t border-white/10 mx-2 mt-4" />
          <div className="p-4 text-sm font-semibold text-white/70">
            <span>Private Chats</span>
          </div>

          {usersLoading ? (
            <div className="text-center py-6 text-white/70">Loading users...</div>
          ) : (
            users
              .filter(user => !userSearch || user.displayName?.toLowerCase().includes(userSearch.toLowerCase()))
              .map((user) => {
                const requestStatus = getRequestStatus(user.id);
                return (
                  <li
                    key={user.id}
                    onClick={() => handleUserClick(user)}
                    className={`flex items-center gap-3 px-4 py-2 transition-colors rounded-lg mx-2 mb-1 cursor-pointer ${
                      selectedUser?.id === user.id ? "bg-white/20" : "hover:bg-white/10 text-white/80"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center font-bold overflow-hidden">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          (user.displayName?.charAt(0) || "?").toUpperCase()
                        )}
                      </div>
                      {unreadMessages[user.id] && (
                        <div className="absolute top-0 right-0 w-3 h-3 bg-purple-500 rounded-full border-2 border-[#5a3f87]" />
                      )}
                    </div>
                    <span className="truncate">{user.displayName || "Invalid User"}</span>
                    
                    {/* Icon Logic: Only show if NOT accepted */}
                    {requestStatus !== 'accepted' && (
                      <button
                        className="ml-auto text-white/70 hover:text-white bg-transparent border-none p-2"
                        onClick={(e) => handleSendRequest(e, user.id)}
                        title={
                          requestStatus === "pending" ? "Request pending" :
                          requestStatus === "rejected" ? "Request rejected. Send again?" :
                          "Send chat request"
                        }
                        disabled={requestStatus === 'pending'}
                      >
                        {requestStatus === "pending" ? (
                          <FontAwesomeIcon icon={faClock} className="text-yellow-400"/>
                        ) : requestStatus === "rejected" ? (
                          <FontAwesomeIcon icon={faTimes} className="text-red-400"/>
                        ) : (
                          <FontAwesomeIcon icon={faUserPlus} />
                        )}
                      </button>
                    )}
                  </li>
                )
              })
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;