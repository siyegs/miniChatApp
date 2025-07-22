import { useState, useEffect, useCallback } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { FiMessageSquare } from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  addOrUpdateUser,
  listenForUsers,
  listenForMessages,
  updateUserDisplayName,
  sendMessage,
  signOutUser,
  deleteMessage,
  editMessage,
  formatTime,
  uploadToImgBB,
} from "../components/chatUtils";
import type { User, Message } from "../components/chatUtils";
import ImageModal from "../components/ImageModal";
import ConfirmModal from "../components/ConfirmModal";
import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import MessageInput from "../components/MessageInput";

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState(
    auth.currentUser?.displayName || ""
  );
  const [newMessage, setNewMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    messageId: string | null;
  }>({ open: false, messageId: null });
  const [userSearch, setUserSearch] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [photoURL, setPhotoURL] = useState(auth.currentUser?.photoURL || ""); // Separate state for photo
  const [previewImage, setPreviewImage] = useState<string | null>(null); // Modal image preview

  const navigate = useNavigate();

  useEffect(() => {
    addOrUpdateUser(displayName);
  }, [displayName]);

  useEffect(() => {
    setUsersLoading(true);
    const unsubscribe = listenForUsers((userList) => {
      setUsers(userList);
      setUsersLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = listenForMessages(selectedUser, setMessages);
    return () => unsubscribe();
  }, [selectedUser]);

  // Handlers using useCallback for performance
  const handleUpdateDisplayName = useCallback(async () => {
    if (
      auth.currentUser &&
      displayName.trim() !== (auth.currentUser.displayName || "")
    ) {
      await updateUserDisplayName(displayName.trim());
    }
    setIsEditingName(false);
  }, [displayName]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() && !fileInput) return;
    if (auth.currentUser) {
      try {
        let content = newMessage.trim() || "Image sent";
        if (fileInput) {
          const imageUrl = await uploadToImgBB(
            fileInput,
            import.meta.env.VITE_IMGBB_API_KEY
          );
          content = imageUrl;
        }
        await sendMessage(content, displayName, selectedUser);
        setNewMessage("");
        setFileInput(null);
      } catch (error) {
        // Optionally, use a toast notification system for errors
        alert(
          "Failed to send message or upload image. Check console for details."
        );
      }
    }
  }, [newMessage, fileInput, displayName, selectedUser]);

  const handleSignOut = useCallback(async () => {
    await signOutUser(navigate);
  }, [navigate]);

  const handleDeleteMessage = useCallback(async () => {
    if (!deleteModal.messageId) {
      console.error("No messageId provided for deletion");
      setDeleteModal({ open: false, messageId: null });
      return;
    }
    try {
      await deleteMessage(deleteModal.messageId);
      setDeleteModal({ open: false, messageId: null });
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("Failed to delete message. Please try again.");
    }
  }, [deleteModal]);

  const handleEditMessage = useCallback(
    async (messageId: string) => {
      if (!editingText.trim()) return;
      await editMessage(messageId, editingText);
      setEditingId(null);
      setEditingText("");
    },
    [editingText]
  );

  useEffect(() => {
    if (auth.currentUser) {
      addOrUpdateUser(displayName);
      setPhotoURL(auth.currentUser.photoURL || "");
    } else {
      navigate("/login");
    }
  }, [displayName, navigate]);

  const handleProfileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          const url = await uploadToImgBB(
            file,
            import.meta.env.VITE_IMGBB_API_KEY
          );
          await updateDoc(doc(db, "users", auth.currentUser!.uid), {
            photoURL: url,
          });
          setPhotoURL(url);
        } catch (error) {
          alert("Failed to upload profile picture. Check console for details.");
        }
      }
    },
    []
  );

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
          displayName={displayName}
          setDisplayName={setDisplayName}
          isEditingName={isEditingName}
          setIsEditingName={setIsEditingName}
          handleUpdateDisplayName={handleUpdateDisplayName}
          handleProfileUpload={handleProfileUpload}
          photoURL={photoURL}
          setPreviewImage={setPreviewImage}
          userSearch={userSearch}
          setUserSearch={setUserSearch}
          handleSignOut={handleSignOut}
        />
        {/* Overlay for mobile only, when sidebar is open */}
        <div
          className={`fixed inset-0 bg-black opacity-40 z-20 md:hidden duration-300 ${
            isSidebarOpen ? "block" : "hidden"
          }`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
        <ConfirmModal
          open={deleteModal.open}
          title="Delete Message?"
          description="Are you sure you want to delete this message? This action cannot be undone."
          onCancel={() => setDeleteModal({ open: false, messageId: null })}
          onConfirm={handleDeleteMessage}
          confirmText="Delete"
          cancelText="Cancel"
        />
        <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-0">
          <ChatHeader
            selectedUser={selectedUser}
            setIsSidebarOpen={setIsSidebarOpen}
          />
          {/* Messages Area */}
          <div
            className="flex-1 p-2 sm:p-4 overflow-y-auto bg-gray-500/15"
            style={{
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="relative flex flex-col h-full max-w-4xl mx-auto space-y-3">
              {selectedUser && messages.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="flex flex-col justify-center items-center rounded-lg px-6 py-8 text-center text-base bg-black/70 text-white">
                    <span className="font-semibold">
                      {`Say hey! Start a conversation with `}
                      <br className="md:hidden" />
                      <span className="font-bold max-md:inline-block max-md:pb-2">
                        {selectedUser.displayName}
                      </span>
                    </span>
                    <FiMessageSquare />
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isCurrentUser =
                    msg.from === auth.currentUser?.uid ||
                    (msg.user === auth.currentUser?.displayName && !msg.from);
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${
                        isCurrentUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`group relative max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-2 shadow-lg border transition-all border-black/20 ${
                          isCurrentUser
                            ? "bg-gradient-to-br from-neutral-800 to-neutral-900 text-white border-neutral-700 rounded-br-none"
                            : "bg-white text-neutral-900 border-neutral-100 rounded-bl-none"
                        }`}
                      >
                        {isCurrentUser && editingId !== msg.id && (
                          <div className="absolute left-[3px] top-full -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button
                              onClick={() => {
                                setEditingId(msg.id);
                                setEditingText(msg.text);
                              }}
                              className="bg-neutral-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-neutral-800 shadow"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => {
                                console.log(
                                  "Attempting to delete message with ID:",
                                  msg.id
                                );
                                setDeleteModal({
                                  open: true,
                                  messageId: msg.id,
                                });
                              }}
                              className="bg-neutral-700 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-neutral-800 shadow"
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="w-2.5 h-2.5"
                                color="white"
                              />
                            </button>
                          </div>
                        )}
                        {!isCurrentUser && (
                          <div className="text-sm font-bold text-neutral-700 mb-1">
                            {msg.user}
                          </div>
                        )}
                        {editingId === msg.id ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="px-2 py-1 rounded border bg-white text-neutral-900 focus:outline-none focus:border-neutral-500"
                              autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleEditMessage(msg.id)}
                                className="text-xs bg-neutral-800 text-white px-2 py-1 rounded hover:bg-neutral-900"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  setEditingText("");
                                }}
                                className="text-xs bg-neutral-400 text-white px-2 py-1 rounded hover:bg-neutral-500"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-base break-words whitespace-pre-wrap">
                            {msg.text.startsWith("http") ? (
                              <img
                                src={msg.text}
                                alt="Uploaded"
                                className="max-w-[180px] max-h-[180px] rounded-lg cursor-pointer"
                                onClick={() => setPreviewImage(msg.text)}
                              />
                            ) : (
                              msg.text
                            )}
                          </div>
                        )}
                        <div
                          className={`text-[clamp(0.65rem,2vw,0.655rem)] text-right mt-1 ${
                            isCurrentUser
                              ? "text-neutral-200"
                              : "text-neutral-400"
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <MessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            fileInput={fileInput}
            setFileInput={setFileInput}
          />
        </div>
      </div>
      <ImageModal
        open={!!previewImage}
        imageUrl={previewImage ?? ""}
        onClose={() => setPreviewImage(null)}
      />
    </>
  );
};

export default Chat;
