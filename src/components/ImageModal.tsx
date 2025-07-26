import React from "react";

interface ImageModalProps {
  open: boolean;
  imageUrl: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ open, imageUrl, onClose }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-3xl"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <img
        src={imageUrl}
        alt="Preview"
        className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg border-2 border-[whitesmoke]"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        className="absolute top-4 right-4 text-white text-3xl font-bold bg-black/40 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 focus:outline-none hover:border-none"
        onClick={onClose}
                        onMouseOver={(e) => (e.currentTarget.style.border = "none")}

        aria-label="Close image preview"
      >
        &times;
      </button>
    </div>
  );
};

export default ImageModal;
