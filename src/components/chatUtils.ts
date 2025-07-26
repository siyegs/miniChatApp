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
  getDocs,
} from "firebase/firestore";
import { signOut, updateProfile } from "firebase/auth";
import axios from "axios";
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
} from "firebase/auth";

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
  isDeleted?: boolean;
}

// Add/update user in Firestore
export const addOrUpdateUser = async (displayName: string) => {
  if (!auth.currentUser) {
    console.error("No authenticated user");
    throw new Error("No authenticated user");
  }

  let fallbackName = displayName;
  if (!fallbackName || !fallbackName.trim()) {
    if (auth.currentUser.email) {
      fallbackName = auth.currentUser.email.split("@")[0];
    } else {
      fallbackName = "User";
    }
  }

  const providerId = auth.currentUser.providerData[0]?.providerId || "unknown";
  console.log(`Updating user with provider: ${providerId}`);

  try {
    await setDoc(
      doc(db, "users", auth.currentUser.uid),
      {
        displayName: fallbackName.trim(),
        lastSeen: Date.now(),
        photoURL: auth.currentUser.photoURL || "",
        isDeleted: false,
        createdAt: Date.now(),
        email: auth.currentUser.email || "",
        provider: providerId, // e.g., "password" or "google.com"
      },
      { merge: true }
    );

    // Update auth profile if needed
    if (auth.currentUser.displayName !== fallbackName) {
      await updateProfile(auth.currentUser, {
        displayName: fallbackName,
      });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Listen for users (returns unsubscribe function)
export const listenForUsers = (callback: (users: User[]) => void) => {
  const messagesRef = collection(db, "messages");

  // First, update the current user's information
  if (auth.currentUser) {
    addOrUpdateUser(
      auth.currentUser.displayName ||
        auth.currentUser.email?.split("@")[0] ||
        "User"
    );
  }

  return onSnapshot(
    query(collection(db, "users")),
    async (snapshot) => {
      const currentUid = auth.currentUser?.uid;
      if (!currentUid) return;

      // Get all private messages for current user
      const messagesQuery = query(
        messagesRef,
        where("participants", "array-contains", currentUid)
      );
      const messagesSnapshot = await getDocs(messagesQuery);

      // Get unique user IDs from messages
      const conversationPartnerIds = new Set<string>();
      messagesSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.participants) {
          data.participants.forEach((id: string) => {
            if (id !== currentUid) {
              conversationPartnerIds.add(id);
            }
          });
        }
      });

      // Process users with additional validation
      const userData = snapshot.docs
        .map((doc) => {
          const data = doc.data() as User;
          const { id: _ignored, ...rest } = data;
          return {
            id: doc.id,
            ...rest,
          };
        })
        .filter(
          (user) =>
            user.id !== currentUid &&
            user.displayName && // Ensure user has a displayName
            (!user.isDeleted || conversationPartnerIds.has(user.id))
        ) as User[];

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

  // Load cached messages immediately
  const cachedMessages = getCachedMessages(selectedUser);
  if (cachedMessages.length > 0) {
    callback(cachedMessages.sort((a, b) => a.timestamp - b.timestamp));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const msgData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      const filteredMessages = selectedUser
        ? msgData.filter(
            (msg) =>
              msg.participants?.includes(auth.currentUser?.uid || "") &&
              msg.participants?.includes(selectedUser.id)
          )
        : msgData.filter((msg) => !msg.isPrivate);

      // Cache messages
      cacheMessages(msgData, selectedUser);

      callback(filteredMessages.sort((a, b) => a.timestamp - b.timestamp));
    },
    (error) => {
      console.error("Listen error:", error);
      // Use cached messages on error
      const cachedMessages = getCachedMessages(selectedUser);
      callback(cachedMessages.sort((a, b) => a.timestamp - b.timestamp));
    }
  );
};

// Update display name
export const updateUserDisplayName = async (
  displayName: string,
  photoURL?: string
) => {
  if (!auth.currentUser) return;

  const updates: { displayName: string; photoURL?: string } = {
    displayName: displayName.trim(),
  };

  if (photoURL) {
    updates.photoURL = photoURL;
  }

  await updateProfile(auth.currentUser, updates);
  await setDoc(
    doc(db, "users", auth.currentUser.uid),
    {
      ...updates,
      lastSeen: Date.now(),
    },
    { merge: true }
  );
};

// Send message
// Send message
export const sendMessage = async (
  content: string,
  displayName: string,
  selectedUser: User | null,
  file?: File
 ) => {
  if (!auth.currentUser) return;
  if (!content.trim() && !file) return;
 
  let messageText = content;
 
  // Upload image if provided
  if (file) {
  try {
  const imageUrl = await uploadToImgBB(file, import.meta.env.VITE_IMGBB_API_KEY);
  messageText = imageUrl;
  } catch (error) {
  console.error("Failed to upload image:", error);
  throw new Error("Image upload failed");
  }
  }
 
  const messageData = {
  text: messageText,
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
  throw error;
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

export const updateUserEmail = async (
  currentPassword: string,
  newEmail: string
) => {
  if (!auth.currentUser?.email) throw new Error("No user email found");

  const credential = EmailAuthProvider.credential(
    auth.currentUser.email,
    currentPassword
  );

  await reauthenticateWithCredential(auth.currentUser, credential);
  await updateEmail(auth.currentUser, newEmail);
};

export const updateUserPassword = async (
  currentPassword: string,
  newPassword: string
) => {
  if (!auth.currentUser?.email) throw new Error("No user email found");

  const credential = EmailAuthProvider.credential(
    auth.currentUser.email,
    currentPassword
  );

  await reauthenticateWithCredential(auth.currentUser, credential);
  await updatePassword(auth.currentUser, newPassword);
};

export const deleteUserAccount = async () => {
  if (!auth.currentUser) throw new Error("No user found");

  // Mark user as deleted instead of removing the document
  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    isDeleted: true,
    lastSeen: Date.now(),
  });

  // Delete the user account from Firebase Auth
  await deleteUser(auth.currentUser);
};

const getUserSpecificCacheKey = (
  userId: string | undefined,
  targetUserId?: string
) => {
  if (!userId) return null;
  return targetUserId
    ? `messages_${userId}_${targetUserId}`
    : `messages_global_${userId}`;
};


export const cacheMessages = (
  messages: Message[],
  selectedUser: User | null
) => {
  if (!auth.currentUser?.uid) return;

  try {
    // Split messages into global and private
    const globalMessages = messages.filter((msg) => !msg.isPrivate);
    const privateMessages = messages.filter((msg) => msg.isPrivate);

    // Cache global messages
    const globalKey = getUserSpecificCacheKey(auth.currentUser.uid);
    if (globalKey) {
      localStorage.setItem(globalKey, JSON.stringify(globalMessages));
    }

    // Cache private messages per user
    const uniqueUserIds = new Set(
      privateMessages.flatMap((msg) => msg.participants || [])
    );
    uniqueUserIds.forEach((userId) => {
      if (userId === auth.currentUser?.uid) return;
      if (!auth.currentUser?.uid) return;
      const userKey = getUserSpecificCacheKey(auth.currentUser.uid, userId);
      if (!userKey) return;

      const userMessages = privateMessages.filter((msg) =>
        msg.participants?.includes(userId)
      );
      localStorage.setItem(userKey, JSON.stringify(userMessages));
    });
  } catch (error) {
    console.error("Error caching messages:", error);
  }
};

export const getCachedMessages = (selectedUser: User | null): Message[] => {
  if (!auth.currentUser?.uid) return [];

  try {
    let messages: Message[] = [];

    if (selectedUser) {
      // Get private messages for selected user
      const privateKey = getUserSpecificCacheKey(
        auth.currentUser.uid,
        selectedUser.id
      );
      if (privateKey) {
        const cached = localStorage.getItem(privateKey);
        if (cached) {
          messages = JSON.parse(cached);
        }
      }
    } else {
      // Get global messages
      const globalKey = getUserSpecificCacheKey(auth.currentUser.uid);
      if (globalKey) {
        const cached = localStorage.getItem(globalKey);
        if (cached) {
          messages = JSON.parse(cached);
        }
      }
    }

    return messages;
  } catch (error) {
    console.error("Error getting cached messages:", error);
    return [];
  }
};
