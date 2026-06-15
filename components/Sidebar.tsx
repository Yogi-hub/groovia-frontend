'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MessageSquarePlus, Users, UserCircle, MessagesSquare, CalendarCheck, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { HistoryList } from './HistoryList';
import { UI_CONTENT } from '../lib/content';
import { FEATURES } from '../lib/features';
import { clearLocalChat } from '../lib/chatStorage';
import { cn } from '../lib/utils';

interface Props {
  authed: boolean;
  role?: string | null;
}

export function Sidebar({ authed, role }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  function newChat() {
    clearLocalChat();
    router.push(`/chat?t=${Date.now()}`);
  }

  // For guests, gated links go to /signup with a next= redirect param.
  function hrefFor(realHref: string, gated: boolean): string {
    if (!gated || authed) return realHref;
    return `/signup?next=${encodeURIComponent(realHref)}`;
  }

  const nav = [
    { href: '/chat',    label: UI_CONTENT.sidebar.chat,    icon: MessagesSquare, gated: false },
    { href: '/mentors', label: UI_CONTENT.sidebar.mentors, icon: Users,          gated: true  },
    { href: '/account', label: UI_CONTENT.sidebar.account, icon: UserCircle,     gated: true  },
    { href: '/mentor',  label: UI_CONTENT.sidebar.mentorPortal, icon: CalendarCheck, gated: false },
    ...(role === 'admin' ? [{ href: '/admin', label: UI_CONTENT.sidebar.admin, icon: ShieldCheck, gated: false }] : []),
  ];

  return (
    <aside
      className={cn(
        'hidden md:flex w-64 shrink-0 flex-col h-screen sticky top-0',
        'bg-[radial-gradient(120%_60%_at_0%_0%,rgba(245,158,11,0.10),transparent_55%),linear-gradient(180deg,#0F2C6B_0%,#0B1E4D_60%,#081637_100%)]',
        'text-white',
      )}
    >
      <div className="px-5 py-5">
        <Link href="/chat" aria-label="Immigroov home" className="inline-flex items-center gap-2 select-none">
          <Image
            src="/Immigroov_Transparent_Logo.png"
            alt="Immigroov"
            width={280}
            height={60}
            priority
            className="object-contain brightness-0 invert"
            style={{ height: '28px', width: 'auto' }}
          />
        </Link>
      </div>

      {/* New chat — the accent CTA. Orange on navy = highest contrast. */}
      <div className="px-3">
        <button
          onClick={newChat}
          className={cn(
            'w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold',
            'bg-accent-500 text-white shadow-[0_4px_18px_-4px_rgba(245,158,11,0.45)]',
            'hover:bg-accent-400 active:scale-[0.98] transition-all duration-150',
          )}
        >
          <MessageSquarePlus className="h-4 w-4" />
          {UI_CONTENT.sidebar.newChat}
        </button>
      </div>

      {/* Nav buttons — clearly clickable: tinted background, subtle ring, active emphasis. */}
      <nav className="px-3 mt-6 flex flex-col gap-1.5">
        {nav.map(({ href, label, icon: Icon, gated }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={hrefFor(href, gated)}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                'transition-all duration-200',
                active
                  ? 'bg-white/15 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'
                  : 'bg-white/[0.04] text-white/75 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-accent-300' : 'text-white/60 group-hover:text-white/90')} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Recent chats — hidden via FEATURES.chatHistory (off by default). */}
      {FEATURES.chatHistory && (
        <div className="flex-1 overflow-y-auto mt-4">
          <HistoryList open={authed} />
        </div>
      )}
    </aside>
  );
}
