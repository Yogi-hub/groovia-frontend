'use client';

import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { UI_CONTENT, INTENT_OPTIONS } from '../lib/content';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MD_COMPONENTS: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  a: (props) => (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="!text-blue-600 !underline !underline-offset-4 hover:!text-blue-800 font-semibold"
    />
  ),
};

export default function ChatInterface() {
  const [threadId] = useState<string>(() => uuidv4());
  const [messages,       setMessages]       = useState<ChatMessage[]>([
    { role: 'assistant', content: UI_CONTENT.welcomeMessage },
  ]);
  const [input,          setInput]          = useState<string>('');
  const [loading,        setLoading]        = useState<boolean>(false);
  const [resumeUploaded, setResumeUploaded] = useState<boolean>(false);
  const [intentSelected, setIntentSelected] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (resumeUploaded) return;
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setMessages(prev => [...prev, { role: 'user', content: UI_CONTENT.uploadIndicator }]);
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('message', '[SYSTEM_RESUME_UPLOADED]');
    formData.append('thread_id', threadId);

    try {
      const res  = await fetch('/api/chat', { method: 'POST', body: formData });
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.response || UI_CONTENT.errors.noResponse },
      ]);
      setResumeUploaded(true);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: UI_CONTENT.errors.backendUnreachable },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    setIntentSelected(true);
    setLoading(true);

    const formData = new FormData();
    formData.append('message', trimmed);
    formData.append('thread_id', threadId);

    try {
      const res  = await fetch('/api/chat', { method: 'POST', body: formData });
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.response || UI_CONTENT.errors.noResponse },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: UI_CONTENT.errors.backendUnreachable },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.docx"
        className="hidden"
        disabled={resumeUploaded}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto pt-8 pb-36 px-4 space-y-4">

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                  m.role === 'user' ? 'bg-gray-100 text-gray-900' : 'text-gray-900'
                }`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 px-4 py-3">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0ms]"   />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          {resumeUploaded && !intentSelected && !loading && (
            <div className="pt-2">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                {UI_CONTENT.intentPrompt}
              </p>
              <div className="flex flex-wrap gap-3">
                {INTENT_OPTIONS.map(({ label, message }) => (
                  <button
                    key={label}
                    onClick={() => sendMessage(message)}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      <div className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto flex items-center bg-gray-100 rounded-full px-3 py-2 gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || resumeUploaded}
            title={resumeUploaded ? UI_CONTENT.tooltips.resumeAlreadyUploaded : UI_CONTENT.tooltips.attachResume}
            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder={UI_CONTENT.inputPlaceholder}
            rows={1}
            className="flex-1 bg-transparent border-none outline-none text-sm resize-none leading-relaxed py-0.5"
          />

          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="flex-shrink-0 bg-black text-white text-sm px-4 py-1.5 rounded-full transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800"
          >
            Send
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          {UI_CONTENT.disclaimer}
        </p>
      </div>
    </div>
  );
}