// Utility functions for chat operations (Firestore, Auth, etc.)
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

// Message and User interfaces (re-export for convenience)
export interface Message {
  id: string;
  text: string;
  user: string;
  timestamp: number;
  isPrivate?: boolean;
  to?: string;
  from?: string;
  participants?: string[];
}

export interface User {
  id: string;
  displayName: string;
  lastSeen: number;
}

// Add/update user in Firestore
export const addOrUpdateUser = async (displayName: string) => {
  if (!auth.currentUser) {
    console.error("No authenticated user");
    return;
  }
  let fallbackName = auth.currentUser.displayName;
  if (!fallbackName || !fallbackName.trim()) {
    if (auth.currentUser.email) {
      fallbackName = auth.currentUser.email.split("@")[0];
    } else {
      fallbackName = "User";
    }
  }
  try {
    await setDoc(doc(db, "users", auth.currentUser.uid), {
      displayName: displayName.trim() || fallbackName,
      lastSeen: Date.now(),
    }, { merge: true });
  } catch (error) {
    console.error("Error updating user:", error);
  }
};

// Listen for users (returns unsubscribe function)
export const listenForUsers = (callback: (users: User[]) => void) => {
  return onSnapshot(collection(db, "users"), (snapshot) => {
    const userData = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((user) => user.id !== auth.currentUser?.uid) as User[];
    callback(userData);
  }, (error) => {
    console.error("Listen error:", error);
  });
};

// Listen for messages (returns unsubscribe function)
export const listenForMessages = (
  selectedUser: User | null,
  callback: (messages: Message[]) => void
) => {
  const messagesRef = collection(db, "messages");
  const q = selectedUser
    ? query(
        messagesRef,
        where("isPrivate", "==", true),
        where("participants", "array-contains", auth.currentUser?.uid)
      )
    : query(messagesRef, where("isPrivate", "==", false));

  return onSnapshot(q, (snapshot) => {
    const msgData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[];
    const currentUid = auth.currentUser?.uid;
    const filteredMessages = selectedUser
      ? msgData.filter(
          (msg) =>
            currentUid &&
            msg.participants?.includes(currentUid) &&
            (msg.from === currentUid || msg.to === currentUid)
        )
      : msgData;
    callback(filteredMessages.sort((a, b) => a.timestamp - b.timestamp));
  }, (error) => console.error("Listen error:", error));
};

// Update display name
export const updateUserDisplayName = async (displayName: string) => {
  if (
    auth.currentUser &&
    displayName.trim() !== (auth.currentUser.displayName || "")
  ) {
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
  }
};

// Send message

export const sendMessage = async (
  newMessage: string,
  displayName: string,
  selectedUser: User | null
) => {
  if (!newMessage.trim() || !auth.currentUser) return;
  const messageData: any = {
    text: newMessage,
    user: displayName || auth.currentUser.displayName || "Anonymous",
    timestamp: Date.now(),
    isPrivate: !!selectedUser,
    from: auth.currentUser.uid,
    to: selectedUser ? selectedUser.id : undefined,
    participants: selectedUser ? [auth.currentUser.uid, selectedUser.id].sort() : undefined,
  };
  try {
    await addDoc(collection(db, "messages"), messageData);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};
// Sign out
export const signOutUser = async (navigate: (path: string) => void) => {
  await signOut(auth);
  navigate("/");
};

// Delete message
export const deleteMessage = async (messageId: string) => {
  await deleteDoc(doc(db, "messages", messageId));
};

// Edit message
export const editMessage = async (messageId: string, newText: string) => {
  if (!newText.trim()) return;
  await updateDoc(doc(db, "messages", messageId), {
    text: newText,
  });
};

// Format time
export const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

// Last active text
export const getLastActiveText = (lastSeen: number) => {
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