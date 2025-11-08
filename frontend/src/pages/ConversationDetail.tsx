import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  content: string;
  sender: string;
  timestamp: string;
}

interface Conversation {
  id: number;
  title: string | null;
  status: string;
  start_timestamp: string;
  end_timestamp: string | null;
  summary: string | null;
  messages: Message[];
  duration: number;
}

export const ConversationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchConversation(parseInt(id));
    }
  }, [id]);

  const fetchConversation = (conversationId: number) => {
    setLoading(true);
    fetch(`http://localhost:8000/api/conversations/${conversationId}/`)
      .then(response => response.json())
      .then(data => {
        setConversation(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching conversation:', error);
        setLoading(false);
      });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Conversation not found</p>
          <button
            onClick={() => navigate('/conversations')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-start">
          <div>
            <button
              onClick={() => navigate('/conversations')}
              className="text-blue-600 hover:text-blue-800 mb-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-800">
              {conversation.title || `Conversation ${conversation.id}`}
            </h1>
            <div className="flex gap-4 text-sm text-gray-600 mt-2">
              <span>Started: {formatDate(conversation.start_timestamp)}</span>
              {conversation.end_timestamp && (
                <span>Ended: {formatDate(conversation.end_timestamp)}</span>
              )}
              <span>Duration: {formatDuration(conversation.duration)}</span>
              <span>Messages: {conversation.messages.length}</span>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              conversation.status === 'ACTIVE'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {conversation.status}
          </span>
        </div>
      </div>

      {/* Summary */}
      {conversation.summary && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Summary</h2>
          <p className="text-gray-700">{conversation.summary}</p>
        </div>
      )}

      {/* Messages */}
      <div className="px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Messages</h2>
          <div className="space-y-4">
            {conversation.messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg ${
                  message.sender === 'USER'
                    ? 'bg-blue-50 ml-8'
                    : 'bg-gray-50 mr-8'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-800">{message.sender}</span>
                  <span className="text-xs text-gray-500">{formatDate(message.timestamp)}</span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

