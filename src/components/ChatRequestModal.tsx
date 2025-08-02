// src/components/ChatRequestModal.tsx

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { acceptChatRequest, rejectChatRequest } from "./chatUtils";
import type { EnrichedChatRequest } from "../pages/Chat";
import { FiUser } from "react-icons/fi";

interface ChatRequestModalProps {
  requests: EnrichedChatRequest[];
  onClose: () => void;
  onPictureClick: (url: string) => void;
}

const ChatRequestModal: React.FC<ChatRequestModalProps> = ({
  requests,
  onClose,
  onPictureClick,
}) => {
  const handleAccept = async (requestId: string) => {
    try {
      await acceptChatRequest(requestId);
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectChatRequest(requestId);
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  if (pendingRequests.length === 0) {
      // It's better to show an empty state than to just return null,
      // because the user explicitly clicked to open this.
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faUserPlus} className="text-blue-500" />
                Chat Requests
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="p-8 text-center text-gray-500">
              You have no pending chat requests.
            </div>
          </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FontAwesomeIcon icon={faUserPlus} className="text-blue-500" />
            Chat Requests ({pendingRequests.length})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          {pendingRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1">
                <button 
                  onClick={() => request.user?.photoURL && onPictureClick(request.user.photoURL)}
                  className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden border-none p-0 disabled:cursor-default"
                  disabled={!request.user?.photoURL}
                >
                  {request.user?.photoURL ? (
                    <img src={request.user.photoURL} alt={request.fromUserName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
                        <FiUser />
                    </div>
                  )}
                </button>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {request.fromUserName}
                  </p>
                  <p className="text-sm text-gray-500">
                    wants to start a conversation
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(request.id)}
                  className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                  title="Accept"
                >
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Reject"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatRequestModal;