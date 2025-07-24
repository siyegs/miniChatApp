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
} from "../components/chatUtils";
import type { User, Message as MessageType } from "../components/chatUtils";
import ImageModal from "../components/ImageModal";
import ConfirmModal from "../components/ConfirmModal";
import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import MessageInput from "../components/MessageInput";
import Message from "../components/Message";
import chatPattern from "/chat-bg3-copy.jpg";

const Chat = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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

  const navigate = useNavigate();

  // Add image caching function
  const cacheImage = useCallback(async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        localStorage.setItem(`img_${url}`, base64data);
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
      setUsers(userList);
      setUsersLoading(false);
    });

    return () => unsubscribeUsers();
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = listenForMessages(selectedUser, setMessages);
    return () => unsubscribe();
  }, [selectedUser]);

  // Cache images effect
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.text.startsWith("http")) {
        const cached = localStorage.getItem(`img_${msg.text}`);
        if (!cached) {
          cacheImage(msg.text);
        }
      }
    });
  }, [messages, cacheImage]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() && !fileInput) return;
    if (!auth.currentUser?.displayName) return;

    try {
      await sendMessage(
        newMessage.trim() || "Image sent",
        auth.currentUser.displayName,
        selectedUser
      );
      setNewMessage("");
      setFileInput(null);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [newMessage, fileInput, selectedUser]);

  const handleEditMessage = useCallback(
    async (messageId: string) => {
      if (!editingText.trim()) return;
      await editMessage(messageId, editingText);
      setEditingId(null);
      setEditingText("");
    },
    [editingText]
  );

  const handleDeleteMessage = useCallback(async () => {
    if (!deleteModal.messageId) return;
    try {
      await deleteMessage(deleteModal.messageId);
      setDeleteModal({ open: false, messageId: null });
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  }, [deleteModal.messageId]);

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
              {selectedUser && messages.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="flex flex-col justify-center items-center rounded-lg px-6 py-8 text-center text-base bg-black/60 text-[whitesmoke]">
                    <span className="font-semibold">
                      Start a conversation with{" "}
                      <span className="font-bold">{selectedUser.displayName}</span>
                    </span>
                    <FiMessageSquare />
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <Message
                    key={msg.id}
                    message={msg}
                    isCurrentUser={
                      msg.from === auth.currentUser?.uid ||
                      (msg.user === auth.currentUser?.displayName && !msg.from)
                    }
                    editingId={editingId}
                    editingText={editingText}
                    setEditingId={setEditingId}
                    setEditingText={setEditingText}
                    handleEditMessage={handleEditMessage}
                    setDeleteModal={setDeleteModal}
                    setPreviewImage={setPreviewImage}
                  />
                ))
              )}
            </div>
          </div>

          <MessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            fileInput={fileInput}
            setFileInput={setFileInput}
            isUploading={false}
          />
        </div>
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