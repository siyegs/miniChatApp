import React from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-xs flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-lg font-semibold text-neutral-900 mb-4">
          {title}
        </div>
        <div className="text-neutral-600 mb-6 text-center">{description}</div>
        <div className="flex gap-3 w-full">
          <button
            className="flex-1 py-2 rounded bg-neutral-200 text-neutral-800 hover:bg-neutral-300 transition"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="flex-1 py-2 rounded bg-gray-800 text-white hover:bg-red-700 transition"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
