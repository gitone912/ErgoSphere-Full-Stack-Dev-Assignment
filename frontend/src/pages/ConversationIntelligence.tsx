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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-3xl font-bold text-gray-800">Conversation Intelligence</h1>
        <p className="text-gray-600 mt-1">Ask questions about your past conversations</p>
      </div>

      {/* Query Form */}
      <div className="px-6 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
              Ask a question about your past conversations
            </label>
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What did we discuss about project deadlines? What were the main topics in my conversations last week?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Querying...' : 'Query Conversations'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-6">
            {/* Answer */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Answer</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{result.answer}</p>
            </div>

            {/* Relevant Excerpts */}
            {result.relevant_excerpts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Relevant Excerpts</h2>
                <div className="space-y-4">
                  {result.relevant_excerpts.map((excerpt, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-800">
                          {excerpt.conversation_title}
                        </span>
                        <span className="text-xs text-gray-500">{formatDate(excerpt.timestamp)}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{excerpt.content}</p>
                      <span className="text-xs text-gray-500 mt-1 inline-block">
                        {excerpt.sender}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Conversations */}
            {result.related_conversations.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Related Conversations</h2>
                <div className="space-y-2">
                  {result.related_conversations.map((conv) => (
                    <div key={conv.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-800 font-medium">{conv.title || `Conversation ${conv.id}`}</span>
                      <span className="text-sm text-gray-600">{formatDate(conv.start_timestamp)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

