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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
          <p className="mt-4 text-neutral-600 font-medium">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass rounded-2xl shadow-large border border-neutral-200/50 p-12">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-neutral-700 text-lg font-semibold mb-2">Conversation not found</p>
          <p className="text-neutral-500 mb-6">The conversation you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => navigate('/conversations')}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-medium shadow-medium hover:shadow-glow transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="glass rounded-2xl shadow-medium border border-neutral-200/50 p-8 mb-8">
        <div className="flex justify-between items-start gap-6">
          <div className="flex-1">
            <button
              onClick={() => navigate('/conversations')}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-4 transition-colors group"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-large flex-shrink-0">
                <span className="text-white font-bold text-2xl">#{conversation.id}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                  {conversation.title || `Conversation ${conversation.id}`}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Started: {formatDate(conversation.start_timestamp)}</span>
                  </div>
                  {conversation.end_timestamp && (
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Ended: {formatDate(conversation.end_timestamp)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Duration: {formatDuration(conversation.duration)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{conversation.messages.length} messages</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <span
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 h-fit ${
              conversation.status === 'ACTIVE'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-medium'
                : 'bg-neutral-200 text-neutral-700'
            }`}
          >
            {conversation.status}
          </span>
        </div>
      </div>

      {/* Summary */}
      {conversation.summary && (
        <div className="glass rounded-2xl shadow-medium border border-primary-200/50 bg-gradient-to-br from-primary-50 to-accent-50 p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-medium">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-neutral-800">Summary</h2>
          </div>
          <p className="text-neutral-700 leading-relaxed">{conversation.summary}</p>
        </div>
      )}

      {/* Messages */}
      <div className="glass rounded-2xl shadow-medium border border-neutral-200/50 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-medium">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-neutral-800">Messages</h2>
        </div>
        <div className="space-y-4">
          {conversation.messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-4 animate-fade-in ${message.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`max-w-2xl flex gap-3 ${message.sender === 'USER' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shadow-medium ${
                  message.sender === 'USER'
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                    : 'bg-gradient-to-br from-neutral-200 to-neutral-300 text-neutral-700'
                }`}>
                  {message.sender === 'USER' ? 'U' : 'AI'}
                </div>
                
                {/* Message Bubble */}
                <div className={`flex flex-col gap-1 ${message.sender === 'USER' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl shadow-soft transition-all duration-200 ${
                    message.sender === 'USER'
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-md'
                      : 'bg-white text-neutral-800 border border-neutral-200/50 rounded-bl-md'
                  }`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold opacity-80">{message.sender}</span>
                      <span className={`text-xs opacity-60 ${message.sender === 'USER' ? 'text-white' : 'text-neutral-500'}`}>
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                    <p className={`leading-relaxed whitespace-pre-wrap ${
                      message.sender === 'USER' ? 'text-white' : 'text-neutral-700'
                    }`}>
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

