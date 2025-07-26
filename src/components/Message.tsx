import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPen } from "@fortawesome/free-solid-svg-icons";
import type { Message as MessageType } from "./chatUtils";
import { formatTime } from "./chatUtils";

interface MessageProps {
  message: MessageType;
  isCurrentUser: boolean;
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
  editingId,
  editingText,
  setEditingId,
  setEditingText,
  handleEditMessage,
  setDeleteModal,
  setPreviewImage,
}) => {
  const isEditable = Date.now() - message.timestamp <= 5 * 60 * 1000; // 5 minutes
  const isImage = message.text.startsWith("http");
  const cachedImage = isImage ? localStorage.getItem(`img_${message.text}`) : null;
  const imageSrc = cachedImage || message.text;

  return (
    <div
      className={`flex items-end gap-2 ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`group relative max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-2 shadow-lg transition-all ${
          isCurrentUser
            ? "bg-[#743fc9] text-white rounded-br-none ml-auto"
            : "bg-white/95 text-neutral-900 rounded-bl-none mr-auto"
        }`}
      >
        {isCurrentUser && editingId !== message.id && (
          <div className="absolute right-0 bottom-[-10px] opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 mt-1">
            {isEditable && (
              <button
                onClick={() => {
                  setEditingId(message.id);
                  setEditingText(message.text);
                }}
                className="bg-white/20 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-white/30 backdrop-blur-sm"
              >
                <FontAwesomeIcon
                  icon={faPen}
                  className="w-2.5 h-2.5 text-neutral-700"
                />
              </button>
            )}
            <button
              onClick={() =>
                setDeleteModal({ open: true, messageId: message.id })
              }
              className="bg-white/20 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-white/30 backdrop-blur-sm"
            >
              <FontAwesomeIcon
                icon={faTrash}
                className="w-2.5 h-2.5 text-neutral-700"
              />
            </button>
          </div>
        )}
        {!isCurrentUser && (
          <div className="text-sm font-bold text-neutral-700 mb-1">
            {message.user}
          </div>
        )}
        {editingId === message.id ? (
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
                onClick={() => handleEditMessage(message.id)}
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
            {isImage ? (
              <div className="relative">
                <img
                  src={imageSrc}
                  alt="Uploaded"
                  className="max-w-[180px] max-h-[180px] rounded-lg cursor-pointer object-cover"
                  onClick={() => setPreviewImage(message.text)}
                  onError={(e) => {
                    e.currentTarget.src = message.text; // Fallback to online URL
                  }}
                />
                {!cachedImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                    <svg
                      className="animate-spin h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                  </div>
                )}
              </div>
            ) : (
              message.text
            )}
          </div>
        )}
        <div
          className={`text-[clamp(0.65rem,2vw,0.655rem)] text-right mt-1 ${
            isCurrentUser ? "text-neutral-200" : "text-neutral-400"
          }`}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Message);