// src/pages/Chat.tsx

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FiMessageSquare } from "react-icons/fi";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import {
  listenForUsers,
  sendMessage,
  signOutUser,
  editMessage,
  deleteMessage,
  listenForAllChatRequests,
  sendChatRequest,
  revokeChatAccess,
  grantChatAccess,
  listenForMessages,
  getMutedChats,
  setMutedChats,
  canUsersChat,
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
  const [mutedChats, setMutedChats] = useState<string[]>([]);
  const [latestMessages, setLatestMessages] = useState<{ [key: string]: MessageType }>({});
  const [isChatActive, setIsChatActive] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [showChatRequests, setShowChatRequests] = useState(false);
  
  const navigate = useNavigate();
  const prevRequestsRef = useRef<ChatRequest[]>();
  const chimeRef = useRef<HTMLAudioElement | null>(null);
  const selectedUserRef = useRef<User | null | undefined>();
  const componentMountTimeRef = useRef<number | null>(null);

  useEffect(() => {
    chimeRef.current = new Audio('/chime.mp3');
    chimeRef.current.volume = 0.5;
    componentMountTimeRef.current = Date.now();
    setMutedChats(getMutedChats());
  }, []);
  
  useEffect(() => {
      selectedUserRef.current = selectedUser;
      const checkStatus = async () => {
          if (selectedUser && auth.currentUser) {
              const canChat = await canUsersChat(auth.currentUser.uid, selectedUser.id);
              setIsChatActive(canChat);
          } else {
              setIsChatActive(true);
          }
      };
      checkStatus();
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
    const updatedMuted = isMuted ? mutedChats.filter(id => id !== chatId) : [...mutedChats, chatId];
    setMutedChats(updatedMuted);
    setMutedChats(updatedMuted);
  };
  
  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = listenForUsers((userList) => {
      setUsers(userList);
      setUsersLoading(false);
    });
    return unsubscribe;
  }, []);
  
  useEffect(() => {
    if (selectedUser === undefined) return;
    const unsubscribe = listenForMessages(selectedUser, setMessages);
    return unsubscribe;
  }, [selectedUser]);

  useEffect(() => {
    if (!auth.currentUser) return () => {};
    const privateQuery = query(collection(db, "messages"), where("to", "==", auth.currentUser.uid));
    const unsubPrivate = onSnapshot(privateQuery, (snapshot) => handleNotifications(snapshot, 'private'));
    const globalQuery = query(collection(db, "messages"), where("isPrivate", "==", false));
    const unsubGlobal = onSnapshot(globalQuery, (snapshot) => handleNotifications(snapshot, 'global'));
    return () => {
        unsubPrivate();
        unsubGlobal();
    };
  }, [mutedChats]);

  const handleNotifications = (snapshot: any, type: 'private' | 'global') => {
    snapshot.docChanges().forEach((change: any) => {
      const message = { id: change.doc.id, ...change.doc.data() } as MessageType;
      if (change.type === "added" && message.timestamp > (componentMountTimeRef.current || 0) && message.from !== auth.currentUser?.uid) {
        const chatId = type === 'private' ? message.from! : 'global';
        const currentChatId = selectedUserRef.current ? selectedUserRef.current.id : 'global';
        if (chatId !== currentChatId) {
          setUnreadMessages(prev => ({ ...prev, [chatId]: true }));
          if (!mutedChats.includes(chatId)) {
            chimeRef.current?.play().catch(e => console.error("Chime play error:", e));
          }
        }
      }
    });
  };

  useEffect(() => {
    if (!auth.currentUser) return () => {};
    const privateQuery = query(collection(db, "messages"), where("participants", "array-contains", auth.currentUser.uid));
    const unsubPrivate = onSnapshot(privateQuery, (snapshot) => {
        const latestMsgs: { [key: string]: MessageType } = {};
        snapshot.docs.forEach(doc => {
            const msg = { id: doc.id, ...doc.data() } as MessageType;
            const otherUserId = msg.participants?.find(p => p !== auth.currentUser?.uid);
            if (otherUserId) {
                if (!latestMsgs[otherUserId] || msg.timestamp > latestMsgs[otherUserId].timestamp) {
                    latestMsgs[otherUserId] = msg;
                }
            }
        });
        setLatestMessages(prev => ({ ...prev, ...latestMsgs }));
    });
    const globalQuery = query(collection(db, "messages"), where("isPrivate", "==", false), orderBy("timestamp", "desc"), limit(1));
    const unsubGlobal = onSnapshot(globalQuery, (snapshot) => {
        if (!snapshot.empty) {
            const latestGlobal = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as MessageType;
            setLatestMessages(prev => ({ ...prev, global: latestGlobal }));
        }
    });
    return () => {
        unsubPrivate();
        unsubGlobal();
    };
  }, []);
  
  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = listenForAllChatRequests((requests) => {
      setChatRequests(requests);
      if (selectedUser) {
          const currentRequest = requests.find(r => r.participants.includes(selectedUser.id));
          setIsChatActive(currentRequest?.status === 'accepted');
      }
      if (requests.some(req => req.toUserId === auth.currentUser?.uid && req.status === 'pending')) {
        setShowChatRequests(true);
      }
    });
    return unsubscribe;
  }, [selectedUser]);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aMsg = latestMessages[a.id];
      const bMsg = latestMessages[b.id];
      if (aMsg && !bMsg) return -1;
      if (!aMsg && bMsg) return 1;
      if (aMsg && bMsg) {
          return bMsg.timestamp - aMsg.timestamp;
      }
      return a.displayName.localeCompare(b.displayName);
    });
  }, [users, latestMessages]);

  const handleRevokeAccess = async () => {
    const userToRevoke = revokeModal.userToRevoke;
    if (!userToRevoke || !auth.currentUser) return;
    try {
      await revokeChatAccess(auth.currentUser.uid, userToRevoke.id);
      setIsChatActive(false);
      alert(`Chat access for ${userToRevoke.displayName} has been revoked.`);
    } catch (error: any) {
      alert(`Failed to revoke access: ${error.message}`);
    } finally {
      setRevokeModal({ open: false, userToRevoke: null });
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedUser || !auth.currentUser) return;
    try {
        await grantChatAccess(auth.currentUser.uid, selectedUser.id);
        setIsChatActive(true);
        alert(`Chat access has been granted to ${selectedUser.displayName}.`);
    } catch (error: any) {
        alert(`Failed to grant access: ${error.message}`);
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
          latestMessages={latestMessages}
          isChatActive={isChatActive} // <-- Pass down the active state
        />
        <div className={`fixed inset-0 bg-black opacity-40 z-20 md:hidden duration-300 ${isSidebarOpen ? "block" : "hidden"}`} onClick={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-h-0">
          <ChatHeader
            selectedUser={selectedUser}
            setIsSidebarOpen={setIsSidebarOpen}
            setPreviewImage={setPreviewImage}
            onRevokeClick={() => setRevokeModal({ open: true, userToRevoke: selectedUser || null })}
            onGrantClick={handleGrantAccess}
            isChatActive={isChatActive}
            onMuteClick={() => toggleMuteChat(selectedUser ? selectedUser.id : 'global')}
            isMuted={mutedChats.includes(selectedUser ? selectedUser.id : 'global')}
          />
          <div className="flex-1 p-2 sm:p-4 overflow-y-auto" style={{ backgroundImage: `url(${chatPattern})`, backgroundSize: "300px", backgroundRepeat: "repeat" }}>
            <div className="relative flex flex-col h-full max-w-4xl mx-auto space-y-3">
              {usersLoading || selectedUser === undefined ? (
                <div className="flex-1 flex items-center justify-center text-white">Loading chat...</div>
              ) : messages.length === 0 && isChatActive ? (
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
                    showUserName={!selectedUser}
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
          
          {isChatActive ? (
            <MessageInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleSendMessage={handleSendMessage}
              fileInput={fileInput}
              setFileInput={setFileInput}
              isUploading={isUploading}
            />
          ) : (
            <div className="p-4 bg-red-800/50 text-white text-center text-sm">
              Chat access is currently revoked.
            </div>
          )}
          
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