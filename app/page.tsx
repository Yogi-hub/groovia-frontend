'use client';

import React from 'react';
import Image from 'next/image';
import ChatInterface from '../components/ChatInterface';

export default function HomePage() {
  
  // Resets React state and generates fresh thread UUID
  const handleNewChat = () => {
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900 overflow-hidden">
      <aside className="hidden md:flex flex-col w-[260px] bg-[#f9f9f9] border-r border-gray-200 p-3">
        
        <div className="px-3 py-4 mb-2">
          <Image
            src="/Immigroov_Transparent_Logo.png"
            alt="Immigroov"
            width={120}
            height={32}
            priority
            className="h-8 w-auto object-contain mb-2"
          />
          <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Groovia • AI career engine</p>
        </div>

        <button 
          type="button"
          onClick={handleNewChat}
          className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg px-3 py-2.5 transition-colors shadow-sm w-full cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span className="text-sm font-medium">New chat</span>
        </button>
      </aside>
      
      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        <header className="md:hidden flex items-center justify-between p-3 border-b border-gray-100">
          <button type="button" className="p-2 rounded-md hover:bg-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <Image src="/Immigroov_Transparent_Logo.png" alt="Immigroov" width={80} height={20} className="h-5 w-auto" />
          <button type="button" onClick={handleNewChat} className="p-2 rounded-md hover:bg-gray-100 cursor-pointer">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
             </svg>
          </button>
        </header>
        <ChatInterface />
      </main>
    </div>
  );
}