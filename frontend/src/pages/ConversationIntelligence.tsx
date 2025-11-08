import React, { useState } from 'react';

interface QueryResult {
  answer: string;
  relevant_excerpts: Array<{
    conversation_id: number;
    conversation_title: string;
    content: string;
    sender: string;
    timestamp: string;
  }>;
  related_conversations: Array<{
    id: number;
    title: string;
    start_timestamp: string;
  }>;
}

export const ConversationIntelligence: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/conversations/query/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          max_results: 5,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to query conversations');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-large">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-neutral-800 mb-2">Conversation Intelligence</h1>
            <p className="text-neutral-500 text-lg">Ask questions about your past conversations and get intelligent insights</p>
          </div>
        </div>
      </div>

      {/* Query Form */}
      <div className="glass rounded-2xl shadow-large border border-neutral-200/50 p-8 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="query" className="block text-sm font-semibold text-neutral-700 mb-3">
              Ask a question about your past conversations
            </label>
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What did we discuss about project deadlines? What were the main topics in my conversations last week?"
              className="w-full px-5 py-4 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none bg-white text-neutral-800 placeholder-neutral-400"
              rows={5}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-8 py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold shadow-medium hover:shadow-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-medium hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Querying...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Query Conversations</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass rounded-2xl shadow-medium border border-red-200/50 bg-gradient-to-br from-red-50 to-red-100 p-6 mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shadow-medium flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Answer */}
          <div className="glass rounded-2xl shadow-large border border-primary-200/50 bg-gradient-to-br from-primary-50 to-accent-50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-medium">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-800">Answer</h2>
            </div>
            <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap text-lg">{result.answer}</p>
          </div>

          {/* Relevant Excerpts */}
          {result.relevant_excerpts.length > 0 && (
            <div className="glass rounded-2xl shadow-large border border-neutral-200/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-medium">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">Relevant Excerpts</h2>
              </div>
              <div className="space-y-4">
                {result.relevant_excerpts.map((excerpt, index) => (
                  <div 
                    key={index} 
                    className="border-l-4 border-primary-500 pl-6 py-4 bg-white rounded-r-xl shadow-soft border border-neutral-200/50 hover:shadow-medium transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <span className="font-semibold text-neutral-800">
                          {excerpt.conversation_title}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-500 font-medium bg-neutral-100 px-3 py-1 rounded-lg">
                        {formatDate(excerpt.timestamp)}
                      </span>
                    </div>
                    <p className="text-neutral-700 mb-2 leading-relaxed">{excerpt.content}</p>
                    <span className="text-xs text-neutral-500 font-medium inline-flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {excerpt.sender}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Conversations */}
          {result.related_conversations.length > 0 && (
            <div className="glass rounded-2xl shadow-large border border-neutral-200/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-medium">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-neutral-800">Related Conversations</h2>
              </div>
              <div className="grid gap-3">
                {result.related_conversations.map((conv, index) => (
                  <div 
                    key={conv.id} 
                    className="flex justify-between items-center p-4 bg-white rounded-xl shadow-soft border border-neutral-200/50 hover:shadow-medium transition-all duration-200 cursor-pointer group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-medium flex-shrink-0 group-hover:scale-110 transition-transform">
                        <span className="text-white font-bold text-sm">#{conv.id}</span>
                      </div>
                      <span className="text-neutral-800 font-semibold">{conv.title || `Conversation ${conv.id}`}</span>
                    </div>
                    <span className="text-sm text-neutral-500 font-medium bg-neutral-100 px-3 py-1.5 rounded-lg">
                      {formatDate(conv.start_timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

