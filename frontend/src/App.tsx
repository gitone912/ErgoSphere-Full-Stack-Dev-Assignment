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
    return location.pathname === path || (path === '/conversations' && location.pathname.startsWith('/conversations/'));
  };

  return (
    <nav className="glass border-b border-neutral-200/50 backdrop-blur-xl sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-10">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-medium group-hover:shadow-glow transition-all duration-300">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-2xl font-bold text-gradient">ErgoSphere</span>
            </Link>
            <div className="flex space-x-2">
              <Link
                to="/chat"
                className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive('/chat')
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-medium'
                    : 'text-neutral-700 hover:bg-neutral-100/80 hover:text-primary-600'
                }`}
              >
                Chat
              </Link>
              <Link
                to="/conversations"
                className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive('/conversations')
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-medium'
                    : 'text-neutral-700 hover:bg-neutral-100/80 hover:text-primary-600'
                }`}
              >
                Conversations
              </Link>
              <Link
                to="/intelligence"
                className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive('/intelligence')
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-medium'
                    : 'text-neutral-700 hover:bg-neutral-100/80 hover:text-primary-600'
                }`}
              >
                Intelligence
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export const App = () => {
  return (
    <Router>
      <div className="min-h-screen">
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
