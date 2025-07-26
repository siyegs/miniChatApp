import { useState, useEffect, useCallback } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FiMessageSquare } from "react-icons/fi";
import {
  listenForUsers,
  listenForMessages,
  sendMessage,
  signOutUser,
  editMessage,
  deleteMessage,
  getCachedMessages,
} from "../components/chatUtils";
import type { User, Message as MessageType } from "../components/chatUtils";
import ImageModal from "../components/ImageModal";
import ConfirmModal from "../components/ConfirmModal";
import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import MessageInput from "../components/MessageInput";
import Message from "../components/Message";
import chatPattern from "/chat-bg3-copy.jpg";

// Custom hook for persistent selected chat
function usePersistentSelectedChat(
  users: User[],
  usersLoading: boolean
): [User | null, (user: User | null) => void] {
  const [selectedUser, setSelectedUserState] = useState<
    User | null | undefined
  >(undefined); // undefined = loading

  // On users loaded, restore from localStorage
  useEffect(() => {
    if (usersLoading) return;
    const chatId = localStorage.getItem("selectedChat");
    if (chatId && chatId !== "global") {
      const user = users.find((u: User) => u.id === chatId && !u.isDeleted);
      if (user) {
        setSelectedUserState(user);
        return;
      }
    }
    // Default to global if not found
    setSelectedUserState(null);
    localStorage.setItem("selectedChat", "global");
  }, [users, usersLoading]);

  // When selectedUser changes, persist to localStorage
  const setSelectedUser = (userOrNull: User | null) => {
    setSelectedUserState(userOrNull);
    if (userOrNull) {
      localStorage.setItem("selectedChat", userOrNull.id);
    } else {
      localStorage.setItem("selectedChat", "global");
    }
  };

  return [selectedUser, setSelectedUser];
}

const Chat = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [selectedUser, setSelectedUser] = usePersistentSelectedChat(
    users,
    usersLoading
  );
  const [newMessage, setNewMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    messageId: string | null;
  }>({ open: false, messageId: null });
  const [userSearch, setUserSearch] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();

  // Add image caching function with storage cleanup
  const cacheImage = useCallback(async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        try {
          // Clean up old images if storage is near limit
          const maxStorageSize = 5 * 1024 * 1024; // 5MB
          let totalSize = 0;
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith("img_")) {
              totalSize += ((localStorage.getItem(key)?.length || 0) * 3) / 4;
            }
          }
          if (totalSize > maxStorageSize * 0.8) {
            const imageKeys = Object.keys(localStorage)
              .filter((key) => key.startsWith("img_"))
              .slice(0, 5);
            imageKeys.forEach((key) => localStorage.removeItem(key));
          }
          localStorage.setItem(`img_${url}`, base64data);
          console.log(`Cached image: ${url}`);
        } catch (error) {
          console.error("Error saving image to localStorage:", error);
          alert("Failed to cache image. Storage may be full.");
        }
      };
    } catch (error) {
      console.error("Error caching image:", error);
    }
  }, []);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }

    const unsubscribeUsers = listenForUsers((userList) => {
      console.log(
        "Users loaded:",
        userList.map((u) => ({
          id: u.id,
          displayName: u.displayName,
          isDeleted: u.isDeleted,
        }))
      );
      setUsers(userList);
      setUsersLoading(false);
    });

    return () => unsubscribeUsers();
  }, [navigate]);

  // Load cached messages immediately on mount
  useEffect(() => {
    if (selectedUser === undefined) return;
    const cachedMessages = getCachedMessages(selectedUser);
    if (cachedMessages.length > 0) {
      setMessages(cachedMessages.sort((a, b) => a.timestamp - b.timestamp));
      console.log("Loaded cached messages:", cachedMessages.length);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser === undefined) return;
    const unsubscribe = listenForMessages(selectedUser, (msgs) => {
      setMessages(msgs);
      console.log("Firestore messages loaded:", msgs.length);
    });
    return () => unsubscribe();
  }, [selectedUser]);

  // Cache images effect
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.text.startsWith("http")) {
        const cached = localStorage.getItem(`img_${msg.text}`);
        if (!cached && !isOffline) {
          cacheImage(msg.text);
        }
      }
    });
  }, [messages, cacheImage, isOffline]);

  // Add online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() && !fileInput) return;
    if (!auth.currentUser?.displayName) return;
    if (isOffline) {
      alert("You are offline. Please reconnect to send messages.");
      return;
    }

    setIsUploading(true);
    try {
      await sendMessage(
        newMessage.trim(),
        auth.currentUser.displayName,
        selectedUser ?? null,
        fileInput || undefined
      );
      setNewMessage("");
      setFileInput(null);
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [newMessage, fileInput, selectedUser, isOffline]);

  const handleEditMessage = useCallback(
    async (messageId: string) => {
      if (!editingText.trim()) return;
      if (isOffline) {
        alert("You are offline. Please reconnect to edit messages.");
        return;
      }
      await editMessage(messageId, editingText);
      setEditingId(null);
      setEditingText("");
    },
    [editingText, isOffline]
  );

  const handleDeleteMessage = useCallback(async () => {
    if (!deleteModal.messageId) return;
    if (isOffline) {
      alert("You are offline. Please reconnect to delete messages.");
      return;
    }
    try {
      await deleteMessage(deleteModal.messageId);
      setDeleteModal({ open: false, messageId: null });
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  }, [deleteModal.messageId, isOffline]);


  return (
    <>
      <div className="flex h-screen w-screen bg-gradient-to-br from-neutral-900 to-neutral-800 font-sans overflow-x-hidden">
        <Sidebar
          users={users}
          usersLoading={usersLoading}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          displayName={auth.currentUser?.displayName || ""}
          photoURL={auth.currentUser?.photoURL || ""}
          setPreviewImage={setPreviewImage}
          userSearch={userSearch}
          setUserSearch={setUserSearch}
          handleSignOut={() => signOutUser(navigate)}
        />

        <div
          className={`fixed inset-0 bg-black opacity-40 z-20 md:hidden duration-300 ${
            isSidebarOpen ? "block" : "hidden"
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col min-h-0">
          <ChatHeader
            selectedUser={selectedUser}
            setIsSidebarOpen={setIsSidebarOpen}
            setPreviewImage={setPreviewImage}
          />

          <div
            className="flex-1 p-2 sm:p-4 overflow-y-auto"
            style={{
              backgroundImage: `url(${chatPattern})`,
              backgroundSize: "300px",
              backgroundPosition: "center",
              backgroundRepeat: "repeat",
            }}
          >
            <div className="relative flex flex-col h-full max-w-4xl mx-auto space-y-3">
              {usersLoading || selectedUser === undefined ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="flex flex-col justify-center items-center rounded-lg px-6 py-8 text-center text-base bg-[#743fc9]/80 text-[whitesmoke]">
                    <svg
                      className="animate-spin h-6 w-6 text-white mb-2"
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
                    <span>Loading chat...</span>
                  </div>
                </div>
              ) : selectedUser && messages.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="flex flex-col justify-center items-center rounded-lg px-6 py-8 text-center text-base bg-[#743fc9]/80 text-[whitesmoke]">
                    <span className="font-semibold">
                      Start a conversation with{" "}
                      <span className="font-bold">
                        {selectedUser.displayName}
                      </span>
                    </span>
                    <FiMessageSquare />
                  </div>
                </div>
              ) : (
                <>
                  {isOffline && messages.length > 0 && (
                    <div className="text-center text-sm text-white/80 bg-[#743fc9]/50 p-2 rounded-lg mb-2">
                      Viewing cached messages. Reconnect to send or receive new
                      messages.
                    </div>
                  )}
                  {messages.map((msg) => (
                    <Message
                      key={msg.id}
                      message={msg}
                      isCurrentUser={
                        msg.from === auth.currentUser?.uid ||
                        (msg.user === auth.currentUser?.displayName &&
                          !msg.from)
                      }
                      editingId={editingId}
                      editingText={editingText}
                      setEditingId={setEditingId}
                      setEditingText={setEditingText}
                      handleEditMessage={handleEditMessage}
                      setDeleteModal={setDeleteModal}
                      setPreviewImage={setPreviewImage}
                    />
                  ))}
                </>
              )}
            </div>
          </div>

          <MessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            fileInput={fileInput}
            setFileInput={setFileInput}
            isUploading={isUploading}
          />
        </div>

        {/* {isOffline && (
          <div className="fixed flex flex-col justify-center items-center bottom-[50%] left-[50%] bg-gray-400 text-black px-4 py-2 text-center text-sm w-[50%] mx-auto">
            You are offline. Messages will load when you reconnect.
            <FiWifiOff className="w-5 h-5 text-black/80 mt-2" />
          </div>
        )} */}
      </div>

      <ImageModal
        open={!!previewImage}
        imageUrl={previewImage ?? ""}
        onClose={() => setPreviewImage(null)}
      />

      <ConfirmModal
        open={deleteModal.open}
        title="Delete Message?"
        description="Are you sure you want to delete this message?"
        onCancel={() => setDeleteModal({ open: false, messageId: null })}
        onConfirm={handleDeleteMessage}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default Chat;
