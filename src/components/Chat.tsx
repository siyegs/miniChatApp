import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  doc,
  updateDoc,
  deleteDoc,
  where,
  setDoc,
} from "firebase/firestore";
import { signOut, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  FiLogOut,
  FiMenu,
  FiUser,
  FiEdit2,
  FiMessageCircle,
  FiMessageSquare,
} from "react-icons/fi";
import chatBG from "/chatDoodleBG.jpg";

interface Message {
  id: string;
  text: string;
  user: string;
  timestamp: number;
  isPrivate?: boolean;
  to?: string;
  from?: string;
}

interface User {
  id: string;
  displayName: string;
  lastSeen: number;
}

const Chat: React.FC = () => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState(
    auth.currentUser?.displayName || ""
  );
  const [newMessage, setNewMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed on mobile
  const [isEditingName, setIsEditingName] = useState(false);
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    messageId: string | null;
  }>({ open: false, messageId: null });

  // Add/update user in Firestore
  useEffect(() => {
    if (auth.currentUser) {
      setDoc(doc(db, "users", auth.currentUser.uid), {
        displayName: displayName || auth.currentUser.displayName,
        lastSeen: Date.now(),
      });
    }
  }, [displayName]);

  // Listen for users
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const userData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user) => user.id !== auth.currentUser?.uid) as User[];
      setUsers(userData);
    });
    return () => unsubscribe();
  }, []);

  // Listen for messages
  useEffect(() => {
    const messagesRef = collection(db, "messages");
    const q = selectedUser
      ? query(
          messagesRef,
          where("isPrivate", "==", true),
          where("participants", "array-contains", auth.currentUser?.uid)
        )
      : query(messagesRef, where("isPrivate", "==", false));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      const filteredMessages = selectedUser
        ? msgData.filter(
            (msg) =>
              (msg.from === auth.currentUser?.uid &&
                msg.to === selectedUser.id) ||
              (msg.to === auth.currentUser?.uid && msg.from === selectedUser.id)
          )
        : msgData;

      setMessages(filteredMessages.sort((a, b) => a.timestamp - b.timestamp));
    });
    return () => unsubscribe();
  }, [selectedUser]);

  // Update display name
  const handleUpdateDisplayName = async () => {
    if (
      auth.currentUser &&
      displayName.trim() !== (auth.currentUser.displayName || "")
    ) {
      try {
        await updateProfile(auth.currentUser, {
          displayName: displayName.trim(),
        });
        await setDoc(
          doc(db, "users", auth.currentUser.uid),
          {
            displayName: displayName.trim(),
          },
          { merge: true }
        );
      } catch (error) {
        // Optionally show user feedback
      }
    }
    setIsEditingName(false);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage,
        user: displayName || auth.currentUser?.displayName || "Anonymous",
        timestamp: Date.now(),
        isPrivate: !!selectedUser,
        ...(selectedUser && {
          to: selectedUser.id,
          from: auth.currentUser?.uid,
          participants: [selectedUser.id, auth.currentUser?.uid],
        }),
      });
      setNewMessage("");
    } catch (err) {
      // Optionally show user feedback
    }
  };

  // Sign out
  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  // Delete message (now uses modal)
  const handleDeleteMessage = async () => {
    if (deleteModal.messageId) {
      try {
        await deleteDoc(doc(db, "messages", deleteModal.messageId));
      } catch (err) {
        // Optionally show user feedback
      }
      setDeleteModal({ open: false, messageId: null });
    }
  };

  // Edit message
  const handleEditMessage = async (messageId: string) => {
    if (!editingText.trim()) return;
    try {
      await updateDoc(doc(db, "messages", messageId), {
        text: editingText,
      });
      setEditingId(null);
      setEditingText("");
    } catch (err) {
      // Optionally show user feedback
    }
  };

  // Format time
  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  // Last active text
  const getLastActiveText = (lastSeen: number) => {
    const now = Date.now();
    const diffMin = Math.floor((now - lastSeen) / 60000);
    if (diffMin < 1) return "Active now";
    const formatted = new Date(lastSeen).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `Last seen: ${formatted}`;
  };

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-neutral-900 to-neutral-800 font-sans overflow-x-hidden">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 bg-white/90 backdrop-blur-md shadow-xl text-neutral-900 flex flex-col border-r border-neutral-200`}
      >
        {/* User Info & Actions */}
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center">
              <FiUser className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 border-0 rounded bg-neutral-100 text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-neutral-500 focus:outline-none"
                    placeholder="Set display name"
                    autoFocus
                    onBlur={handleUpdateDisplayName}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdateDisplayName();
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="font-bold text-neutral-900 text-base line-clamp-1">
                    {displayName}
                  </p>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-neutral-600 bg-neutral-100 hover:text-neutral-900 hover:border-none p-1 -mr-1 rounded"
                  >
                    <FiEdit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-neutral-800 to-neutral-700 hover:from-neutral-900 hover:to-neutral-800 text-white rounded shadow transition-colors"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          <p className="p-4 text-sm font-semibold text-neutral-700">Users</p>
          <ul>
            <li
              key="global"
              onClick={() => setSelectedUser(null)}
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors rounded-lg mx-2 mb-1 ${
                !selectedUser
                  ? "bg-neutral-100 text-neutral-900"
                  : "hover:bg-neutral-50 text-neutral-700"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold">
                #
              </div>
              <span className="font-semibold">Global Chat</span>
            </li>
            {users.map((user) => (
              <li
                key={user.id}
                onClick={() => {
                  setSelectedUser(user);
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors rounded-lg mx-2 mb-1 ${
                  selectedUser?.id === user.id
                    ? "bg-neutral-100 text-neutral-900"
                    : "hover:bg-neutral-50 text-neutral-700"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-bold">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <span>{user.displayName}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Overlay for mobile only, when sidebar is open */}
      <div
        className={`fixed inset-0 bg-black opacity-40 z-20 md:hidden transition-opacity duration-300 ${
          isSidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-xs flex flex-col items-center">
            <div className="text-lg font-semibold text-neutral-900 mb-4">
              Delete Message?
            </div>
            <div className="text-neutral-600 mb-6 text-center">
              Are you sure you want to delete this message? This action cannot
              be undone.
            </div>
            <div className="flex gap-3 w-full">
              <button
                className="flex-1 py-2 rounded bg-neutral-200 text-neutral-800 hover:bg-neutral-300 transition"
                onClick={() => setDeleteModal({ open: false, messageId: null })}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2 rounded bg-gray-800 text-white hover:bg-red-700 transition"
                onClick={handleDeleteMessage}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between px-0 p-3 md:p-5 bg-white/90 backdrop-blur-md text-neutral-900 shadow border-b border-neutral-200">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-neutral-700 hover:text-neutral-900 bg-inherit hover:border-none md:hidden"
            >
              <FiMenu className="hover:border-none" />
            </button>

            {selectedUser ? (
              <div className="flex items-center gap-3 md:ml-4">
                <div className="w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center text-white font-bold">
                  {selectedUser.displayName.charAt(0).toUpperCase()}
                </div>

                {/* us==name and last seen */}
                <div>
                  <h1 className="text-[clamp(0.7rem,4.3vw,1.5rem)] font-bold text-neutral-900">
                    {selectedUser.displayName}
                  </h1>
                  <p className="text-[clamp(0.5rem,3vw,1rem)] text-neutral-500">
                    {getLastActiveText(selectedUser.lastSeen)}
                  </p>
                </div>
              </div>
            ) : (
              <h1 className="text-lg font-semibold text-neutral-900 md:ml-4">
                Global Chat
              </h1>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div
          className="flex-1 p-2 sm:p-4 overflow-y-auto bg-slate-300"
          style={{
            // backgroundImage: `url(${chatBG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="relative flex flex-col h-full max-w-4xl mx-auto space-y-3">
            {selectedUser && messages.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="flex flex-col justify-center items-center rounded-lg px-6 py-8 text-center text-base bg-black/70 text-white ">
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
                        <div className="absolute left-[-40px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
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
                            onClick={() =>
                              setDeleteModal({ open: true, messageId: msg.id })
                            }
                            className="bg-neutral-900 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-neutral-800 shadow"
                          >
                            ×
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
                          {msg.text}
                        </div>
                      )}
                      {/* time messag is sent */}
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

        {/* Input Area */}
        <div className="p-2 sm:p-4 bg-white/90 border-t border-neutral-200">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 px-4 py-2 border-2 border-neutral-200 rounded-full focus:outline-none focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800 transition-colors text-neutral-900 bg-neutral-50 placeholder-neutral-400"
              placeholder="Type a message..."
            />
            <button
              onClick={handleSendMessage}
              className="px-6 py-2 bg-gradient-to-r from-neutral-900 to-neutral-700 text-white font-semibold rounded-full hover:from-neutral-800 hover:to-neutral-900 transition-colors shadow-md disabled:bg-neutral-300"
              disabled={!newMessage.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
