// App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ChatInterface } from './pages/ChatInterface';
import { ConversationsDashboard } from './pages/ConversationsDashboard';
import { ConversationIntelligence } from './pages/ConversationIntelligence';
import { ConversationDetail } from './pages/ConversationDetail';

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-bold text-gray-800">
            AI Chat Portal
          </Link>
          <div className="flex space-x-4">
            <Link
              to="/chat"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive('/chat')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Chat
            </Link>
            <Link
              to="/conversations"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive('/conversations') || location.pathname.startsWith('/conversations/')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Conversations
            </Link>
            <Link
              to="/intelligence"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive('/intelligence')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Intelligence
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<ChatInterface />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/conversations" element={<ConversationsDashboard />} />
          <Route path="/conversations/:id" element={<ConversationDetail />} />
          <Route path="/intelligence" element={<ConversationIntelligence />} />
        </Routes>
      </div>
    </Router>
  );
};
