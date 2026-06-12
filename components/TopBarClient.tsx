'use client';
import { useState } from 'react';
import Link from 'next/link';
import { LogOut, LogIn, User as UserIcon } from 'lucide-react';
import { Button } from './ui/Button';
import { createClient } from '../lib/supabase/client';

const LS_CHAT_KEYS = [
  'groovia.threadId',
  'groovia.messages',
  'groovia.resumeUploaded',
  'groovia.intentSelected',
];

function clearLocalChat() {
  if (typeof window === 'undefined') return;
  for (const k of LS_CHAT_KEYS) window.localStorage.removeItem(k);
}

export function TopBarClient({ email }: { email: string | null }) {
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    clearLocalChat();
    // Hard navigate so the server-rendered shell sees the new (signed-out) state immediately.
    window.location.href = '/chat';
  }

  return (
    // Sticky but FULLY TRANSPARENT — content scrolls behind the chip area unobstructed.
    // pointer-events-none on the wrapper lets clicks fall through to the page; the chip
    // re-enables pointer-events for itself.
    <div className="sticky top-0 z-30 pointer-events-none">
      <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-3">
        {email ? (
          <div className="flex items-center gap-2 animate-fade-up pointer-events-auto">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-md text-brand-900 text-sm shadow-[0_4px_18px_-6px_rgba(15,23,42,0.18)]">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-brand-700 to-accent-500 flex items-center justify-center text-white text-[10px] font-semibold">
                {(email[0] ?? 'U').toUpperCase()}
              </div>
              <span className="font-medium max-w-[180px] truncate">{email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              loading={signingOut}
              className="bg-transparent shadow-none hover:bg-card/60"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
            <Link href="/account" className="sm:hidden">
              <Button variant="ghost" size="sm" aria-label="Account" className="bg-card/90 backdrop-blur-md">
                <UserIcon className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <Link href="/login" className="pointer-events-auto">
            <Button size="sm" className="shadow-[0_4px_18px_-6px_rgba(15,42,107,0.4)]">
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
