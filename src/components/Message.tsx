import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
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
  return (
    <div
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
        {isCurrentUser && editingId !== message.id && (
          <div className="absolute left-[3px] top-full -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <button
              onClick={() => {
                setEditingId(message.id);
                setEditingText(message.text);
              }}
              className="bg-neutral-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-neutral-800 shadow"
            >
              ✎
            </button>
            <button
              onClick={() =>
                setDeleteModal({ open: true, messageId: message.id })
              }
              className="bg-neutral-700 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-neutral-800 shadow"
            >
              <FontAwesomeIcon
                icon={faTrash}
                className="w-2.5 h-2.5"
                color="white"
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
            {message.text.startsWith("http") ? (
              <img
                src={message.text}
                alt="Uploaded"
                className="max-w-[180px] max-h-[180px] rounded-lg cursor-pointer"
                onClick={() => setPreviewImage(message.text)}
              />
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
