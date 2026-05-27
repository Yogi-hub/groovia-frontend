// # Main application layout overview

import React from 'react';
import ChatInterface from '../components/ChatInterface';

export default function HomePage() {
  return (
    <div className="flex h-screen bg-white font-sans text-gray-900 overflow-hidden">
      <aside className="hidden md:flex flex-col w-[260px] bg-[#f9f9f9] border-r border-gray-200 p-3">
        <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg px-3 py-2.5 transition-colors shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span className="text-sm font-medium">New chat</span>
        </button>
      </aside>
      
      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        <header className="md:hidden flex items-center justify-between p-3 border-b border-gray-100">
          <button className="p-2 rounded-md hover:bg-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <span className="font-medium text-gray-800">Groovia</span>
          <div className="w-9" />
        </header>
        <ChatInterface />
      </main>
    </div>
  );
}