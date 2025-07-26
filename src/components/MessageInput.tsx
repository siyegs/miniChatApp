import React from "react";
import { FiUpload, FiX, FiSend } from "react-icons/fi";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (msg: string) => void;
  handleSendMessage: () => void;
  fileInput: File | null;
  setFileInput: (file: File | null) => void;
  isUploading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  setNewMessage,
  handleSendMessage,
  fileInput,
  setFileInput,
  isUploading,
}) => {
  const previewUrl = fileInput ? URL.createObjectURL(fileInput) : null;

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="flex p-3 md:p-4 bg-gray-700/20 backdrop-blur-md border-t border-[#743fc9]/20 gap-3">
      <div className="flex items-center w-full rounded-xl bg-white/10 px-4 gap-4">
        <div className="w-full">
          {fileInput && (
            <div className="relative mb-2">
              <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden border border-white/10">
                <img
                  src={previewUrl || ""}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => setFileInput(null)}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 transition-colors"
                disabled={isUploading}
              >
                <FiX size={12} />
              </button>
            </div>
          )}

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !isUploading && handleSendMessage()
            }
            className="w-full py-2 bg-transparent focus:outline-none text-white placeholder-white/60"
            placeholder="Type a message..."
            disabled={isUploading}
          />
        </div>

        <label
          htmlFor="message-upload"
          className={`cursor-pointer p-2 hover:bg-white/10 rounded-lg transition-colors ${
            isUploading ? "opacity-50" : ""
          }`}
        >
          <FiUpload className="w-5 h-5 text-white/80" />
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFileInput(e.target.files?.[0] || null)}
          className="hidden"
          id="message-upload"
          disabled={isUploading}
        />
      </div>

      <button
        onClick={handleSendMessage}
        disabled={isUploading}
        className={`px-4 bg-white/20 text-white rounded-xl transition-colors hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label="Send message"
      >
        {isUploading ? (
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <FiSend size={16} />
        )}
      </button>
    </div>
  );
};

export default MessageInput;