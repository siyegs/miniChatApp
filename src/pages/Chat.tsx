// src/pages/Chat.tsx

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FiMessageSquare,} from "react-icons/fi";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import {
  listenForUsers,
  sendMessage,
  signOutUser,
  editMessage,
  deleteMessage,
  listenForAllChatRequests,
  sendChatRequest,
  revokeChatAccess,
  listenForMessages,
  getMutedChats, // For mute persistence
  // setMutedChats, // For mute persistence
} from "../components/chatUtils";
import type {
  User,
  Message as MessageType,
  ChatRequest,
} from "../components/chatUtils";
import ImageModal from "../components/ImageModal";
import ConfirmModal from "../components/ConfirmModal";
import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import MessageInput from "../components/MessageInput";
import Message from "../components/Message";
import ChatRequestModal from "../components/ChatRequestModal";
import chatPattern from "/chat-bg3-copy.jpg";

// This custom hook is working correctly for persistence. No changes needed.
function usePersistentSelectedChat(
  users: User[],
  usersLoading: boolean
): [User | null | undefined, (user: User | null) => void] {
  const [selectedUser, setSelectedUserState] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    if (usersLoading) return;
    const chatId = localStorage.getItem("selectedChat");
    if (chatId && chatId !== "global") {
      const user = users.find((u) => u.id === chatId && !u.isDeleted);
      if (user) {
        setSelectedUserState(user);
        return;
      }
    }
    setSelectedUserState(null);
    localStorage.setItem("selectedChat", "global");
  }, [users, usersLoading]);

  const setSelectedUser = (userOrNull: User | null) => {
    setSelectedUserState(userOrNull);
    localStorage.setItem("selectedChat", userOrNull ? userOrNull.id : "global");
  };
  return [selectedUser, setSelectedUser];
}

const Chat = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [selectedUser, setSelectedUserState] = usePersistentSelectedChat(users, usersLoading);
  const [newMessage, setNewMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, messageId: null as string | null });
  const [revokeModal, setRevokeModal] = useState({ open: false, userToRevoke: null as User | null });
  const [unreadMessages, setUnreadMessages] = useState<{ [userId: string]: boolean }>({});
  const [mutedChats, setMutedChats] = useState<string[]>([]); // Mute state
  const [userSearch, setUserSearch] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [showChatRequests, setShowChatRequests] = useState(false);
  const navigate = useNavigate();
  const prevRequestsRef = useRef<ChatRequest[]>([]);
  const chimeRef = useRef<HTMLAudioElement | null>(null);
  const selectedUserRef = useRef<User | null | undefined>(null);
  const componentMountTimeRef = useRef<number | null>(null);

  useEffect(() => {
    chimeRef.current = new Audio('/chime.mp3');
    chimeRef.current.volume = 0.5;
    componentMountTimeRef.current = Date.now();
    setMutedChats(getMutedChats()); // Load muted chats from localStorage on mount
  }, []);
  
  useEffect(() => {
      selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  const setSelectedUser = (userOrNull: User | null) => {
    setSelectedUserState(userOrNull);
    const chatToClear = userOrNull ? userOrNull.id : 'global';
    setUnreadMessages(prev => {
      const newUnread = { ...prev };
      delete newUnread[chatToClear];
      return newUnread;
    });
  };

  const toggleMuteChat = (chatId: string) => {
    const isMuted = mutedChats.includes(chatId);
    let updatedMuted;
    if (isMuted) {
      updatedMuted = mutedChats.filter(id => id !== chatId);
    } else {
      updatedMuted = [...mutedChats, chatId];
    }
    setMutedChats(updatedMuted);
    setMutedChats(updatedMuted); // Persist to localStorage
  };
  
  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = listenForUsers((userList) => {
      setUsers(userList);
      setUsersLoading(false);
    });
    return unsubscribe;
  }, []);
  
  // Listener for displaying messages
  useEffect(() => {
    if (selectedUser === undefined) return;
    const unsubscribe = listenForMessages(selectedUser, setMessages);
    return unsubscribe;
  }, [selectedUser]);

  // Listener for ALL notifications
  useEffect(() => {
    if (!auth.currentUser) return () => {};
    const q = query(
      collection(db, "messages"),
      where("from", "!=", auth.currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const message = { id: change.doc.id, ...change.doc.data() } as MessageType;
        if (change.type === "added" && message.timestamp > (componentMountTimeRef.current || 0)) {
          const chatId = message.isPrivate ? message.from! : 'global';
          const currentChatId = selectedUserRef.current ? selectedUserRef.current.id : 'global';
          
          // If the message is not for the currently open chat
          if (chatId !== currentChatId) {
            setUnreadMessages(prev => ({ ...prev, [chatId]: true }));
            // Only play chime if the chat is not muted
            if (!mutedChats.includes(chatId)) {
              chimeRef.current?.play().catch(e => console.error("Chime play error:", e));
            }
          }
        }
      });
    });
    return unsubscribe;
  }, [mutedChats]); // Re-subscribe if mutedChats changes

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = listenForAllChatRequests((requests) => {
      setChatRequests(requests);
      if (requests.some(req => req.toUserId === auth.currentUser?.uid && req.status === 'pending')) {
        setShowChatRequests(true);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;
    const prevRequests = prevRequestsRef.current;
    if (prevRequests) {
      chatRequests.forEach(newRequest => {
        const prevRequest = prevRequests.find(pr => pr.id === newRequest.id);
        if (prevRequest && newRequest.fromUserId === auth.currentUser?.uid && prevRequest.status === 'pending') {
          const recipient = users.find(u => u.id === newRequest.toUserId);
          const recipientName = recipient ? recipient.displayName : 'A user';
          if (newRequest.status === 'accepted') alert(`Your chat request with ${recipientName} was accepted!`);
          else if (newRequest.status === 'rejected') alert(`Your chat request with ${recipientName} was rejected.`);
        }
      });
    }
    prevRequestsRef.current = chatRequests;
  }, [chatRequests, users]);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aHasUnread = unreadMessages[a.id];
      const bHasUnread = unreadMessages[b.id];
      if (aHasUnread && !bHasUnread) return -1;
      if (!aHasUnread && bHasUnread) return 1;
      return a.displayName.localeCompare(b.displayName);
    });
  }, [users, unreadMessages]);

  const handleRevokeAccess = async () => {
    const userToRevoke = revokeModal.userToRevoke;
    if (!userToRevoke || !auth.currentUser) return;
    try {
      await revokeChatAccess(auth.currentUser.uid, userToRevoke.id);
      if (selectedUser?.id === userToRevoke.id) setSelectedUser(null);
      alert(`Chat access for ${userToRevoke.displayName} has been revoked.`);
    } catch (error: any) {
      alert(`Failed to revoke access: ${error.message}`);
    } finally {
      setRevokeModal({ open: false, userToRevoke: null });
    }
  };

  const handleSendChatRequest = async (userId: string) => {
    try {
      await sendChatRequest(userId);
      alert("Chat request sent successfully!");
    } catch (error: any) {
      alert(`Failed to send chat request: ${error.message}`);
    }
  };
  
  const handleSendMessage = useCallback(async () => {
    if ((!newMessage.trim() && !fileInput) || !auth.currentUser) return;
    setIsUploading(true);
    try {
      await sendMessage(newMessage, auth.currentUser.displayName || "User", selectedUser || null, fileInput || undefined);
      setNewMessage("");
      setFileInput(null);
    } catch (error) {
      alert("Failed to send message. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [newMessage, fileInput, selectedUser]);

  const handleEditMessage = useCallback(async (messageId: string) => {
    await editMessage(messageId, editingText);
    setEditingId(null);
    setEditingText("");
  }, [editingText]);

  const handleDeleteMessage = useCallback(async () => {
    if (!deleteModal.messageId) return;
    await deleteMessage(deleteModal.messageId);
    setDeleteModal({ open: false, messageId: null });
  }, [deleteModal.messageId]);

  return (
    <>
      <div className={`flex h-screen w-screen bg-gradient-to-br from-neutral-900 to-neutral-800 font-sans overflow-x-hidden ${previewImage ? "blur-sm" : ""}`}>
        <Sidebar
          users={sortedUsers}
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
          chatRequests={chatRequests}
          onSendChatRequest={handleSendChatRequest}
          unreadMessages={unreadMessages}
        />
        <div className={`fixed inset-0 bg-black opacity-40 z-20 md:hidden duration-300 ${isSidebarOpen ? "block" : "hidden"}`} onClick={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-h-0">
          <ChatHeader
            selectedUser={selectedUser}
            setIsSidebarOpen={setIsSidebarOpen}
            setPreviewImage={setPreviewImage}
            onRevokeClick={() => setRevokeModal({ open: true, userToRevoke: selectedUser || null })}
            onMuteClick={() => toggleMuteChat(selectedUser ? selectedUser.id : 'global')}
            isMuted={mutedChats.includes(selectedUser ? selectedUser.id : 'global')}
          />
          <div className="flex-1 p-2 sm:p-4 overflow-y-auto" style={{ backgroundImage: `url(${chatPattern})`, backgroundSize: "300px", backgroundRepeat: "repeat" }}>
            <div className="relative flex flex-col h-full max-w-4xl mx-auto space-y-3">
              {usersLoading || selectedUser === undefined ? (
                <div className="flex-1 flex items-center justify-center text-white">Loading chat...</div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center bg-[#743fc9]/80 text-white p-4 rounded-lg">
                    <FiMessageSquare className="mx-auto text-4xl mb-2" />
                    No messages yet. Say hello!
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <Message
                    key={msg.id}
                    message={msg}
                    isCurrentUser={msg.from === auth.currentUser?.uid}
                    showUserName={!selectedUser} // Show username only in global chat
                    setEditingId={setEditingId}
                    setEditingText={setEditingText}
                    editingId={editingId}
                    editingText={editingText}
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
            isUploading={isUploading}
          />
        </div>
      </div>
      <ImageModal open={!!previewImage} imageUrl={previewImage || ""} onClose={() => setPreviewImage(null)} />
      <ConfirmModal
        open={revokeModal.open}
        title="Revoke Chat Access?"
        description={`Are you sure you want to revoke chat access for ${revokeModal.userToRevoke?.displayName}?`}
        onCancel={() => setRevokeModal({ open: false, userToRevoke: null })}
        onConfirm={handleRevokeAccess}
        confirmText="Revoke"
        cancelText="Cancel"
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
      {showChatRequests && (
        <ChatRequestModal
          requests={chatRequests.filter(r => r.toUserId === auth.currentUser?.uid)}
          onClose={() => setShowChatRequests(false)}
        />
      )}
    </>
  );
};

export default Chat;