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
import axios from "axios";

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
  photoURL?: string; // Add this line
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
    await setDoc(
      doc(db, "users", auth.currentUser.uid),
      {
        displayName: displayName.trim() || fallbackName,
        lastSeen: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating user:", error);
  }
};

// Listen for users (returns unsubscribe function)
export const listenForUsers = (callback: (users: User[]) => void) => {
  return onSnapshot(
    collection(db, "users"),
    (snapshot) => {
      const userData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user) => user.id !== auth.currentUser?.uid) as User[];
      callback(userData);
    },
    (error) => {
      console.error("Listen error:", error);
    }
  );
};

// Listen for messages (returns unsubscribe function)
export const listenForMessages = (
  selectedUser: User | null,
  callback: (messages: Message[]) => void
) => {
  const messagesRef = collection(db, "messages");
  let q;
  if (selectedUser) {
    q = query(
      messagesRef,
      where("isPrivate", "==", true),
      where("participants", "array-contains", auth.currentUser?.uid)
    );
  } else {
    q = query(messagesRef, where("isPrivate", "==", false));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const msgData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      const currentUid = auth.currentUser?.uid;
      const filteredMessages = selectedUser
        ? msgData.filter(
            (msg) =>
              currentUid &&
              msg.participants &&
              msg.participants.includes(currentUid) &&
              msg.participants.includes(selectedUser.id)
          )
        : msgData;
      callback(filteredMessages.sort((a, b) => a.timestamp - b.timestamp));
    },
    (error) => console.error("Listen error:", error)
  );
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
  content: string,
  displayName: string,
  selectedUser: User | null
) => {
  if (!content.trim() || !auth.currentUser) return;
  const messageData = {
    text: content,
    user: displayName || auth.currentUser.displayName || "Anonymous",
    timestamp: Date.now(),
    isPrivate: !!selectedUser,
    from: auth.currentUser.uid,
  } as any; // Type assertion to allow dynamic properties
  if (selectedUser) {
    messageData.to = selectedUser.id;
    messageData.participants = [auth.currentUser.uid, selectedUser.id].sort();
  }
  try {
    const docRef = await addDoc(collection(db, "messages"), messageData);
    console.log("Message sent with ID:", docRef.id, messageData);
  } catch (error) {
    console.error("Error sending message:", error as any);
  }
};

// Sign out
export const signOutUser = async (navigate: (path: string) => void) => {
  await signOut(auth);
  navigate("/");
};

// Delete message
export const deleteMessage = async (messageId: string) => {
  try {
    await deleteDoc(doc(db, "messages", messageId));
    console.log(`Message ${messageId} deleted successfully`);
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
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
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffMin = Math.floor((now.getTime() - lastSeen) / 60000);

  // Check if last seen is within the last minute
  if (diffMin < 1) return "Active now";

  // Check if last seen is on the same day
  const isSameDay =
    now.getFullYear() === lastSeenDate.getFullYear() &&
    now.getMonth() === lastSeenDate.getMonth() &&
    now.getDate() === lastSeenDate.getDate();

  // Format time
  const timeFormatted = lastSeenDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isSameDay) {
    return `Last seen: ${timeFormatted}`;
  } else {
    // Format date (e.g., "Jul 22")
    const dateFormatted = lastSeenDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `Last seen: ${dateFormatted}, ${timeFormatted}`;
  }
};

export const uploadToImgBB = async (file: File, apiKey: string) => {
  if (!apiKey) {
    throw new Error("ImgBB API key is missing or undefined");
  }
  const formData = new FormData();
  formData.append("image", file);
  formData.append("key", apiKey);
  formData.append("expiration", "0"); // No expiration

  try {
    const response = await axios.post(
      "https://api.imgbb.com/1/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    if (response.data.success) {
      console.log("ImgBB upload success:", response.data.data.url);
      return response.data.data.url;
    } else {
      throw new Error(`ImgBB upload failed: ${response.data.status_txt}`);
    }
  } catch (error) {
    console.error("ImgBB upload error details:", {
      message: (error as any).message,
      response: (error as any).response?.data || "No response data",
    });
    throw error;
  }
};
