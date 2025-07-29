// src/components/Message.tsx

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPen, faClock, faCheckDouble } from "@fortawesome/free-solid-svg-icons";
import type { Message as MessageType } from "./chatUtils";
import { formatTime } from "./chatUtils";

interface MessageProps {
  message: MessageType;
  isCurrentUser: boolean;
  showUserName: boolean;
  editingId: string | null;
  editingText: string;
  setEditingId: (id: string | null) => void;
  setEditingText: (text: string) => void;
  handleEditMessage: (messageId: string) => void;
  setDeleteModal: (modal: { open: boolean; messageId: string | null }) => void;
  setPreviewImage: (url: string | null) => void;
}

const Message: React.FC<MessageProps> = ({
  message,
  isCurrentUser,
  showUserName,
  editingId,
  editingText,
  setEditingId,
  setEditingText,
  handleEditMessage,
  setDeleteModal,
  setPreviewImage,
}) => {
  const isEditable = Date.now() - message.timestamp <= 5 * 60 * 1000;
  const isImage = message.text.startsWith("http");

  return (
    <div className={`flex items-end gap-2 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`group relative max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-2 shadow-lg transition-all ${
          isCurrentUser
            ? "bg-[#523e73] text-white rounded-br-none"
            : "bg-white/95 text-neutral-900 rounded-bl-none"
        }`}
      >
        {isCurrentUser && editingId !== message.id && (
          <div className="absolute right-0 bottom-[-10px] opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            {isEditable && (
              <button onClick={() => { setEditingId(message.id); setEditingText(message.text); }} className="bg-gray-500/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-gray-500/80">
                <FontAwesomeIcon icon={faPen} className="w-2.5 h-2.5" />
              </button>
            )}
            <button onClick={() => setDeleteModal({ open: true, messageId: message.id })} className="bg-red-500/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-500/80">
              <FontAwesomeIcon icon={faTrash} className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
        
        {showUserName && !isCurrentUser && (
          <div className="text-sm font-bold text-purple-700 mb-1">
            {message.user}
          </div>
        )}

        {editingId === message.id ? (
          <div className="flex flex-col gap-2">
            <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} className="p-2 rounded border bg-white text-neutral-900" autoFocus />
            <div className="flex gap-2 justify-end">
              <button onClick={() => handleEditMessage(message.id)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Save</button>
              <button onClick={() => setEditingId(null)} className="text-xs bg-gray-400 text-white px-2 py-1 rounded">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="text-base break-words whitespace-pre-wrap">
            {isImage ? (
              <div className="relative">
                <img src={message.text} alt="Uploaded" className="max-w-[200px] max-h-[200px] rounded-lg cursor-pointer" onClick={() => setPreviewImage(message.text)} />
                {message.status === 'sending' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                    <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  </div>
                )}
              </div>
            ) : (
              message.text
            )}
          </div>
        )}
        <div className={`text-[10px] text-right mt-1 flex items-center justify-end gap-2 ${isCurrentUser ? "text-gray-300" : "text-gray-500"}`}>
          {formatTime(message.timestamp)}
          {isCurrentUser && (
            <FontAwesomeIcon icon={message.status === 'sending' ? faClock : faCheckDouble} className={message.status === 'sent' ? 'text-gray-400' : 'text-blue-400'} />
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Message);