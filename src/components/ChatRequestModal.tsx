import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import type { ChatRequest } from "./chatUtils";
import { acceptChatRequest, rejectChatRequest } from "./chatUtils";

interface ChatRequestModalProps {
  requests: ChatRequest[];
  onClose: () => void;
}

const ChatRequestModal: React.FC<ChatRequestModalProps> = ({
  requests,
  onClose,
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
  if (pendingRequests.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
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

        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {pendingRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {request.fromUserName}
                </p>
                <p className="text-sm text-gray-500">
                  wants to start a conversation
                </p>
              </div>
              <div className="flex gap-2">
                 <button
            // MODIFIED: Call handleAccept with only the request id
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