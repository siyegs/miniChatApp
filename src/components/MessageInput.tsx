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
    <div className="flex p-2 sm:p-4 bg-white/90 border-t border-neutral-200 gap-3">
      <div className="flex  items-center w-full rounded-3xl  bg-white/90 px-3 gap-4">
        <div className="w-full">
          {fileInput && (
            <div className="relative mr-2">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden">
                <img
                  src={previewUrl || ""}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => setFileInput(null)}
                className="absolute -top-2 -right-2 bg-neutral-800 rounded-full p-1 text-white hover:bg-neutral-900"
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
            className="flex-1 py-2 focus:outline-none w-full rounded-3xl transition-colors text-neutral-900 bg-white/90 placeholder-neutral-400 max-md:placeholder:text-sm"
            placeholder="Type a message or upload an image..."
            disabled={isUploading}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFileInput(e.target.files?.[0] || null)}
            className="hidden"
            id="message-upload"
            disabled={isUploading}
          />
        </div>

        <label
          htmlFor="message-upload"
          className={`cursor-pointer ${isUploading ? "opacity-50" : ""}`}
        >
          <FiUpload className="w-5 h-5 text-neutral-600 hover:text-neutral-900" />
        </label>
      </div>

      <button
        onClick={handleSendMessage}
        disabled={isUploading}
        className={`px-6 py-2 bg-gradient-to-r from-neutral-900 to-neutral-700 text-white font-semibold rounded-full transition-colors shadow-md ${
          isUploading
            ? "opacity-50 cursor-not-allowed"
            : "hover:from-neutral-800 hover:to-neutral-900"
        }`}
        aria-label="Send message"
      >
        {isUploading ? "Sending..." : <FiSend />}
      </button>
    </div>
  );
};

export default MessageInput;
