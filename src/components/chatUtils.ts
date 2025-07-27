// src/components/chatUtils.ts

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
  writeBatch,
} from "firebase/firestore";
import { signOut, updateProfile, deleteUser, EmailAuthProvider, reauthenticateWithCredential, verifyBeforeUpdateEmail, updatePassword, getAuth } from "firebase/auth";
import axios from "axios";

// --- INTERFACES ---
export interface Message {
  id: string;
  text: string;
  user: string;
  timestamp: number;
  isPrivate?: boolean;
  to?: string;
  from?: string;
  participants?: string[];
  status?: "sending" | "sent" | "seen";
}

export interface User {
  id: string;
  displayName: string;
  lastSeen: number;
  photoURL?: string;
  isDeleted?: boolean;
}

export interface ChatRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  timestamp: number;
  status: "pending" | "accepted" | "rejected";
  participants: string[];
}

// --- USER & AUTH FUNCTIONS ---
export const addOrUpdateUser = async (displayName: string) => {
  if (!auth.currentUser) throw new Error("No authenticated user");
  let fallbackName = displayName;
  if (!fallbackName || !fallbackName.trim()) {
    fallbackName = auth.currentUser.email?.split("@")[0] || "User";
  }
  const providerId = auth.currentUser.providerData[0]?.providerId || "unknown";
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
        provider: providerId,
      },
      { merge: true }
    );
    if (auth.currentUser.displayName !== fallbackName) {
      await updateProfile(auth.currentUser, { displayName: fallbackName });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const listenForUsers = (callback: (users: User[]) => void) => {
  if (auth.currentUser) {
    addOrUpdateUser(auth.currentUser.displayName || "User");
  }
  return onSnapshot(query(collection(db, "users")), (snapshot) => {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;
    const userData = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as User))
      .filter((user) => user.id !== currentUid && user.displayName && !user.isDeleted);
    callback(userData);
  }, (error) => {
    console.error("Error listening for users:", error);
  });
};

export const signOutUser = async (navigate: (path: string) => void) => {
  await signOut(auth);
  navigate("/");
};

// --- ACCOUNT & PROFILE MANAGEMENT (FOR SETTINGS PAGE) ---
export const updateUserDisplayName = async (displayName: string, photoURL?: string) => {
  if (!auth.currentUser) return;
  const updates: { displayName: string; photoURL?: string } = {
    displayName: displayName.trim(),
  };
  if (photoURL) {
    updates.photoURL = photoURL;
  }
  await updateProfile(auth.currentUser, updates);
  await setDoc(doc(db, "users", auth.currentUser.uid), { ...updates, lastSeen: Date.now() }, { merge: true });
};

export const updateUserEmail = async (currentPassword: string, newEmail: string) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user?.email) throw new Error("No user email found");
  try {
    await verifyBeforeUpdateEmail(user, newEmail);
    return { success: true, verification: true };
  } catch (error: any) {
    if (error.code === "auth/requires-recent-login") {
      if (!currentPassword) throw new Error("Please enter your current password to re-authenticate.");
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      try {
        await reauthenticateWithCredential(user, credential);
        await verifyBeforeUpdateEmail(user, newEmail);
        return { success: true, verification: true };
      } catch (reauthError: any) {
        throw new Error(reauthError.message || "Re-authentication failed.");
      }
    } else if (error.code === "auth/invalid-email") {
      throw new Error("The new email address is invalid.");
    } else if (error.code === "auth/email-already-in-use") {
      throw new Error("This email address is already in use by another account.");
    } else {
      throw new Error(error.message || "Failed to update email.");
    }
  }
};

export const updateUserPassword = async (currentPassword: string, newPassword: string) => {
  if (!auth.currentUser?.email) throw new Error("No user email found");
  const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
  await reauthenticateWithCredential(auth.currentUser, credential);
  await updatePassword(auth.currentUser, newPassword);
};

export const deleteUserAccount = async () => {
  if (!auth.currentUser) throw new Error("No user found");
  await updateDoc(doc(db, "users", auth.currentUser.uid), { isDeleted: true, lastSeen: Date.now() });
  await deleteUser(auth.currentUser);
};

// --- CHAT REQUEST FUNCTIONS ---
export const sendChatRequest = async (toUserId: string) => {
  if (!auth.currentUser) throw new Error("No authenticated user");
  const q = query(collection(db, "chatRequests"), where("participants", "==", [auth.currentUser.uid, toUserId].sort()));
  const existing = await getDocs(q);
  if (existing.docs.some(d => d.data().status === 'pending' || d.data().status === 'accepted')) {
    throw new Error("A request already exists or is accepted.");
  }
  await addDoc(collection(db, "chatRequests"), {
    fromUserId: auth.currentUser.uid,
    fromUserName: auth.currentUser.displayName || "User",
    toUserId: toUserId,
    timestamp: Date.now(),
    status: "pending",
    participants: [auth.currentUser.uid, toUserId].sort(),
  });
};

export const acceptChatRequest = async (requestId: string) => {
  await updateDoc(doc(db, "chatRequests", requestId), { status: "accepted" });
};

export const rejectChatRequest = async (requestId: string) => {
  await updateDoc(doc(db, "chatRequests", requestId), { status: "rejected" });
};

export const revokeChatAccess = async (user1Id: string, user2Id: string) => {
  const q = query(
    collection(db, "chatRequests"),
    where("participants", "==", [user1Id, user2Id].sort()),
    where("status", "==", "accepted")
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) throw new Error("No accepted chat found.");
  const batch = writeBatch(db);
  snapshot.forEach(doc => batch.update(doc.ref, { status: "rejected" }));
  await batch.commit();
};

export const canUsersChat = async (user1Id: string, user2Id: string): Promise<boolean> => {
  const q = query(
    collection(db, "chatRequests"),
    where("participants", "==", [user1Id, user2Id].sort()),
    where("status", "==", "accepted")
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

// --- MESSAGE FUNCTIONS & LISTENERS ---
export const sendMessage = async (content: string, displayName: string, selectedUser: User | null, file?: File) => {
  if (!auth.currentUser || (!content.trim() && !file)) return;
  let messageText = content.trim();
  if (file) {
    try {
      messageText = await uploadToImgBB(file, import.meta.env.VITE_IMGBB_API_KEY);
    } catch (error) {
      console.error("Failed to upload image:", error);
      throw new Error("Image upload failed");
    }
  }
  const baseMessageData = {
    text: messageText,
    user: displayName,
    timestamp: Date.now(),
    from: auth.currentUser.uid,
    status: "sending",
  };
  let finalMessageData;
  if (selectedUser) {
    finalMessageData = { ...baseMessageData, isPrivate: true, to: selectedUser.id, participants: [auth.currentUser.uid, selectedUser.id].sort() };
  } else {
    finalMessageData = { ...baseMessageData, isPrivate: false };
  }
  const docRef = await addDoc(collection(db, "messages"), finalMessageData);
  await updateDoc(docRef, { status: "sent" });
};

export const editMessage = async (messageId: string, newText: string) => {
  if (!newText.trim()) return;
  await updateDoc(doc(db, "messages", messageId), { text: newText });
};

export const deleteMessage = async (messageId: string) => {
  await deleteDoc(doc(db, "messages", messageId));
};

export const listenForMessages = (selectedUser: User | null, callback: (messages: Message[]) => void) => {
  if (!auth.currentUser) return () => {};
  let q;
  if (selectedUser) {
    q = query(
      collection(db, "messages"),
      where("participants", "==", [auth.currentUser.uid, selectedUser.id].sort())
    );
  } else {
    q = query(collection(db, "messages"), where("isPrivate", "==", false));
  }
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    callback(messages.sort((a, b) => a.timestamp - b.timestamp));
  }, (error) => {
    console.error(`Error listening for ${selectedUser ? 'private' : 'global'} messages:`, error);
  });
};

export const listenForAllChatRequests = (callback: (requests: ChatRequest[]) => void) => {
  if (!auth.currentUser) return () => {};
  const q = query(
    collection(db, "chatRequests"),
    where("participants", "array-contains", auth.currentUser.uid)
  );
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ChatRequest));
    callback(requests);
  }, (error) => {
    console.error("Error listening for all chat requests:", error);
  });
};

// --- OTHER UTILITIES ---
export const formatTime = (timestamp: number) => new Date(timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

export const getLastActiveText = (lastSeen: number) => {
    const now = Date.now();
    const diffMin = Math.floor((now - lastSeen) / 60000);
    if (diffMin < 1) return "Active now";
    const lastSeenDate = new Date(lastSeen);
    const timeFormatted = lastSeenDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    if (new Date().toDateString() === lastSeenDate.toDateString()) {
      return `Last seen today at ${timeFormatted}`;
    }
    const dateFormatted = lastSeenDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `Last seen ${dateFormatted}, ${timeFormatted}`;
};

export const uploadToImgBB = async (file: File, apiKey: string): Promise<string> => {
  if (!apiKey) throw new Error("ImgBB API key is missing.");
  const formData = new FormData();
  formData.append("image", file);
  try {
    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData);
    if (response.data.success) {
      return response.data.data.url;
    } else {
      throw new Error(`ImgBB upload failed: ${response.data.error.message}`);
    }
  } catch (error) {
    console.error("ImgBB upload error details:", error);
    throw error;
  }
};

// ** NEW: Mute state management **
export const getMutedChats = (): string[] => {
    const muted = localStorage.getItem("mutedChats");
    return muted ? JSON.parse(muted) : [];
};

export const setMutedChats = (muted: string[]) => {
    localStorage.setItem("mutedChats", JSON.stringify(muted));
};