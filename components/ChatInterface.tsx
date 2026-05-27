'use client';

import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface() {
  const [threadId, setThreadId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [resumeUploaded, setResumeUploaded] = useState<boolean>(false);
  const [intentSelected, setIntentSelected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setThreadId(uuidv4());
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const resetTextarea = () => {
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessages(prev => [...prev, { role: 'user', content: 'Resume uploaded.' }]);
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('message', '[SYSTEM_RESUME_UPLOADED]');
    formData.append('thread_id', threadId);

    try {
      const res = await fetch('/api/chat', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        setResumeUploaded(true);
      } else {
        const errText = await res.text();
        setMessages(prev => [...prev, { role: 'assistant', content: `System Error: ${errText}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network transport execution failed.' }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setIntentSelected(true);
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    resetTextarea();
    setLoading(true);

    const formData = new FormData();
    formData.append('message', textToSend);
    formData.append('thread_id', threadId);

    try {
      const res = await fetch('/api/chat', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        const errText = await res.text();
        setMessages(prev => [...prev, { role: 'assistant', content: `System Error: ${errText}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network transport execution failed.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 relative flex flex-col h-full">
      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-3xl mx-auto w-full pt-8 pb-48 px-4 space-y-6">
          
          {messages.length === 0 && (
            <div className="h-[50vh] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <span className="text-white font-bold text-2xl">G</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">How can I help with your career?</h2>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-[#f4f4f4] rounded-2xl px-5 py-3 text-gray-900' : 'text-gray-900 w-full px-2'}`}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  className="prose prose-sm md:prose-base prose-gray max-w-none break-words"
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start max-w-3xl mx-auto w-full px-2">
              <div className="flex space-x-1.5 py-4 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-white via-white to-transparent pt-10 pb-6 px-4">
        <div className="max-w-3xl mx-auto flex flex-col space-y-4">
          
          {resumeUploaded && !intentSelected && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2 px-2">
              <button onClick={() => sendMessage('I want to generate a career report.')} className="flex flex-col text-left p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
                <span className="font-medium text-sm text-gray-700">Generate Report</span>
              </button>
              <button onClick={() => sendMessage('I want to find a mentor.')} className="flex flex-col text-left p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
                <span className="font-medium text-sm text-gray-700">Find Mentor</span>
              </button>
              <button onClick={() => sendMessage('I just want to ask some questions.')} className="flex flex-col text-left p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
                <span className="font-medium text-sm text-gray-700">Ask Question</span>
              </button>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="relative flex items-end bg-[#f4f4f4] rounded-3xl px-3 py-3 shadow-sm border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all">
            
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx" className="hidden" />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full transition flex-shrink-0"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputResize}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              disabled={!resumeUploaded && messages.length > 0}
              placeholder={resumeUploaded ? "Message Groovia..." : "Attach your resume to begin"}
              className="flex-1 max-h-[200px] bg-transparent border-0 px-3 py-2.5 resize-none focus:outline-none focus:ring-0 text-gray-900 text-base"
              rows={1}
            />

            <button 
              type="submit" 
              disabled={(!resumeUploaded && messages.length > 0) || !input.trim()} 
              className="p-2 mb-0.5 mr-0.5 bg-black text-white rounded-full flex-shrink-0 disabled:bg-[#e5e5e5] disabled:text-gray-400 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </button>
          </form>
          <p className="text-center text-xs text-gray-500">Groovia is an AI career engine and can make mistakes.</p>
        </div>
      </div>
    </div>
  );
}