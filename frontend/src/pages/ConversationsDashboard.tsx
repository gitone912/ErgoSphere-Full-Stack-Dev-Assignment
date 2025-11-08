import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface Conversation {
  id: number;
  title: string | null;
  status: string;
  start_timestamp: string;
  end_timestamp: string | null;
  summary: string | null;
  message_count: number;
  duration: number;
}

export const ConversationsDashboard: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchConversations = useCallback(() => {
    setLoading(true);
    let url = 'http://localhost:8000/api/conversations/';
    const params = new URLSearchParams();
    
    if (statusFilter !== 'all') {
      params.append('status', statusFilter);
    }
    if (searchQuery) {
      params.append('search', searchQuery);
    }
    
    if (params.toString()) {
      url += '?' + params.toString();
    }

    fetch(url)
      .then(response => response.json())
      .then(data => {
        setConversations(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching conversations:', error);
        setLoading(false);
      });
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const handleConversationClick = (id: number) => {
    navigate(`/conversations/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-3xl font-bold text-gray-800">Conversations Dashboard</h1>
        <p className="text-gray-600 mt-1">View and manage all your conversations</p>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="ENDED">Ended</option>
          </select>
        </div>
      </div>

      {/* Conversations List */}
      <div className="px-6 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No conversations found</p>
            <button
              onClick={() => navigate('/chat')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Conversation
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleConversationClick(conv.id)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {conv.title || `Conversation ${conv.id}`}
                    </h3>
                    <div className="flex gap-4 text-sm text-gray-600 mb-2">
                      <span>Started: {formatDate(conv.start_timestamp)}</span>
                      {conv.end_timestamp && (
                        <span>Ended: {formatDate(conv.end_timestamp)}</span>
                      )}
                      <span>Duration: {formatDuration(conv.duration)}</span>
                      <span>Messages: {conv.message_count}</span>
                    </div>
                    {conv.summary && (
                      <p className="text-gray-700 text-sm mt-2 line-clamp-2">{conv.summary}</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      conv.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {conv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

