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
    <div className="min-h-screen max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-neutral-800 mb-2">Conversations</h1>
        <p className="text-neutral-500 text-lg">View and manage all your conversations</p>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl shadow-medium border border-neutral-200/50 p-6 mb-8">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-5 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white font-medium text-neutral-700 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="ENDED">Ended</option>
          </select>
        </div>
      </div>

      {/* Conversations List */}
      <div>
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
            <p className="mt-4 text-neutral-600 font-medium">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl shadow-medium border border-neutral-200/50">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-neutral-700 text-lg font-semibold mb-2">No conversations found</p>
            <p className="text-neutral-500 mb-6">Start a new conversation to get started</p>
            <button
              onClick={() => navigate('/chat')}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-medium shadow-medium hover:shadow-glow transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Start New Conversation
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {conversations.map((conv, index) => (
              <div
                key={conv.id}
                onClick={() => handleConversationClick(conv.id)}
                className="glass rounded-2xl shadow-medium border border-neutral-200/50 p-6 hover:shadow-large transition-all duration-200 cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-medium flex-shrink-0">
                        <span className="text-white font-bold text-lg">#{conv.id}</span>
                      </div>
                      <h3 className="text-xl font-bold text-neutral-800 truncate">
                        {conv.title || `Conversation ${conv.id}`}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-neutral-600 mb-3">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatDate(conv.start_timestamp)}</span>
                      </div>
                      {conv.end_timestamp && (
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatDate(conv.end_timestamp)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatDuration(conv.duration)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{conv.message_count} messages</span>
                      </div>
                    </div>
                    {conv.summary && (
                      <p className="text-neutral-700 text-sm mt-3 line-clamp-2 bg-neutral-50 rounded-lg p-3 border border-neutral-200/50">
                        {conv.summary}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                      conv.status === 'ACTIVE'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-medium'
                        : 'bg-neutral-200 text-neutral-700'
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

