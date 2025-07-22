import React from "react";
import { FiUpload } from "react-icons/fi";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (msg: string) => void;
  handleSendMessage: () => void;
  fileInput: File | null;
  setFileInput: (file: File | null) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  setNewMessage,
  handleSendMessage,
  setFileInput,
}) => (
  <div className="p-2 sm:p-4 bg-white/90 border-t border-neutral-200">
    <div className="flex items-center gap-2 max-w-4xl mx-auto">
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        className="flex-1 px-4 py-2 border-2 border-neutral-200 rounded-full focus:outline-none focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800 transition-colors text-neutral-900 bg-neutral-50 placeholder-neutral-400"
        placeholder="Type a message or upload an image..."
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFileInput(e.target.files?.[0] || null)}
        className="hidden"
        id="message-upload"
      />
      <label htmlFor="message-upload" className="cursor-pointer">
        <FiUpload className="w-6 h-6 text-neutral-600 hover:text-neutral-900" />
      </label>
      <button
        onClick={handleSendMessage}
        className="px-6 py-2 bg-gradient-to-r from-neutral-900 to-neutral-700 text-white font-semibold rounded-full hover:from-neutral-800 hover:to-neutral-900 transition-colors shadow-md"
        aria-label="Send message"
      >
        Send
      </button>
    </div>
  </div>
);

export default MessageInput; 