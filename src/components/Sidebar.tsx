import React from "react";
import { FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import type { User } from "../components/chatUtils";

interface SidebarProps {
  users: User[];
  usersLoading: boolean;
  selectedUser: User | null | undefined; // Allow undefined
  setSelectedUser: (user: User | null) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  displayName: string;
  photoURL: string;
  setPreviewImage: (url: string | null) => void;
  userSearch: string;
  setUserSearch: (search: string) => void;
  handleSignOut: () => void;
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
}) => {
  const navigate = useNavigate();

  const activeUsers = users.filter(
    (user) => !user.isDeleted && user.displayName
  );
  const pastUsers = users.filter((user) => user.isDeleted && user.displayName);

  const handleUserClick = (user: User) => {
    if (!user.displayName || selectedUser === undefined) return; // Disable clicks during loading
    if (!user.isDeleted) {
      setSelectedUser(user);
      setIsSidebarOpen(false);
    }
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } max-md:w-[65%] bg-gradient-to-b from-[#7a5fa7]/80 to-[#5a3f87]/70 backdrop-blur-md shadow-xl text-white flex flex-col border-r border-[#743fc9]/20`}
    >
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="img-holder w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20 cursor-pointer hover:border-white/40 transition-colors">
            {photoURL ? (
              <img
                src={photoURL}
                alt="Profile"
                className="w-full h-full object-cover cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage(photoURL);
                }}
              />
            ) : (
              <FiUser className="w-5 h-5 text-white" />
            )}
          </div>
          <div
            className="w-fit cursor-pointer hover:opacity-80 text-[whitesmoke]/85 font-semibold"
            onClick={() => navigate("/settings")}
          >
            {displayName}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-3 no-scrollbar">
        <div className="px-4 pb-2">
          <input
            type="text"
            value={userSearch || ""}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full px-3 py-1.5 border bg-white/10 placeholder:text-white/60 text-white border-white/10 rounded-lg mb-2 focus:outline-none focus:border-white/30"
            disabled={selectedUser === undefined}
          />
        </div>

        <ul>
          <li
            key="global"
            onClick={() => {
              if (selectedUser === undefined) return;
              setSelectedUser(null);
              setIsSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors rounded-lg mx-2 mb-1 ${
              !selectedUser
                ? "bg-white/20 text-white"
                : "hover:bg-white/10 text-white/80"
            } ${
              selectedUser === undefined ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
              #
            </div>
            <span className="font-semibold">Global Chat</span>
          </li>
          <hr className="border border-gray-600 mx-2 mt-4" />
          <div className="p-4 text-sm font-semibold text-neutral-800 flex items-center justify-between">
            <span>Active Users</span>
            {usersLoading && (
              <div className="animate-spin w-4 h-4 border-2 border-neutral-600 border-t-transparent rounded-full" />
            )}
          </div>

          {usersLoading ? (
            <div className="flex items-center justify-center py-6">
              <svg
                className="animate-spin h-6 w-6 text-neutral-500 mr-2"
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
              <span className="text-neutral-500">Loading private users...</span>
            </div>
          ) : (
            <>
              {activeUsers.length === 0 ? (
                <div className="text-center py-6 text-neutral-500">
                  <span>No users yet</span>
                </div>
              ) : (
                <>
                  {activeUsers
                    .filter(
                      (user) =>
                        !userSearch ||
                        user.displayName
                          ?.toLowerCase()
                          .includes(userSearch.toLowerCase())
                    )
                    .map((user) => (
                      <li
                        key={user.id}
                        onClick={() => handleUserClick(user)}
                        className={`flex items-center gap-3 px-4 py-2 transition-colors rounded-lg mx-2 mb-1  ${
                          !user.displayName || selectedUser === undefined
                            ? "opacity-50 cursor-not-allowed"
                            : user.isDeleted
                            ? "opacity-50 cursor-not-allowed"
                            : selectedUser?.id === user.id
                            ? "bg-neutral-100 cursor-pointer text-gray-900 font-semibold"
                            : "hover:bg-neutral-50 cursor-pointer text-[whitesmoke]/85 font-semibold hover:text-gray-900 active:text-gray-900 focus:text-gray-900"
                        }`}
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-bold overflow-hidden">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt="Profile"
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (user.photoURL) {
                                    setPreviewImage(user.photoURL);
                                  }
                                }}
                              />
                            ) : (
                              (user.displayName?.charAt(0) || "?").toUpperCase()
                            )}
                          </div>
                          {user.isDeleted && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <span className="flex items-center gap-2 truncate max-w-[140px]">
                          {user.displayName || "Invalid User"}
                        </span>
                      </li>
                    ))}
                </>
              )}

              {/* past users */}
              {pastUsers.length > 0 && (
                <>
                  <div className="p-4 text-sm font-semibold text-neutral-700">
                    Past Conversations
                  </div>
                  {pastUsers
                    .filter(
                      (user) =>
                        !userSearch ||
                        user.displayName
                          ?.toLowerCase()
                          .includes(userSearch.toLowerCase())
                    )
                    .map((user) => (
                      <li
                        key={user.id}
                        onClick={() => {
                          if (!user.isDeleted && selectedUser !== undefined) {
                            setSelectedUser(user);
                            setIsSidebarOpen(false);
                          }
                        }}
                        className={`flex items-center gap-3 px-4 py-2 transition-colors rounded-lg mx-2 mb-1 ${
                          user.isDeleted || selectedUser === undefined
                            ? "opacity-50 cursor-not-allowed"
                            : selectedUser?.id === user.id
                            ? "bg-neutral-100 text-neutral-900 cursor-pointer"
                            : "hover:bg-neutral-50 text-neutral-700 cursor-pointer"
                        }`}
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-bold overflow-hidden">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt="Profile"
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewImage(user.photoURL || null);
                                }}
                              />
                            ) : (
                              user.displayName?.charAt(0).toUpperCase() || "?"
                            )}
                          </div>
                          {user.isDeleted && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <span className="flex items-center gap-2">
                          {user.displayName || "Unnamed User"}
                        </span>
                      </li>
                    ))}
                </>
              )}
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
