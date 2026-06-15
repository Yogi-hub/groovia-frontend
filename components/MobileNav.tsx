'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { MessageSquarePlus, Users, UserCircle, MessagesSquare, ChevronDown, Globe2, CalendarCheck } from 'lucide-react';
import { UI_CONTENT } from '../lib/content';
import { clearLocalChat } from '../lib/chatStorage';
import { cn } from '../lib/utils';

interface Props {
  authed: boolean;
}

export function MobileNav({ authed }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  function newChat() {
    clearLocalChat();
    router.push(`/chat?t=${Date.now()}`);
  }

  function hrefFor(realHref: string, gated: boolean): string {
    if (!gated || authed) return realHref;
    return `${pathname}?signup=required`;
  }

  const nav = [
    { href: '/chat',    label: UI_CONTENT.sidebar.chat,    icon: MessagesSquare, gated: false },
    { href: '/mentors', label: UI_CONTENT.sidebar.mentors, icon: Users,          gated: true  },
    { href: '/account', label: UI_CONTENT.sidebar.account, icon: UserCircle,     gated: true  },
    { href: '/mentor',  label: UI_CONTENT.sidebar.mentorPortal, icon: CalendarCheck, gated: true },
  ];

  return (
    <div className="md:hidden sticky top-0 z-40 bg-[linear-gradient(180deg,#0F2C6B_0%,#0B1E4D_60%,#081637_100%)] text-white shadow-md">
      <div
        className={cn(
          'overflow-hidden transition-[max-height] duration-300 ease-in-out',
          collapsed ? 'max-h-0' : 'max-h-40',
        )}
      >
        <div className="px-4 pt-3 flex items-center justify-between gap-3">
          <Link href="/chat" aria-label="Immigroov home" className="inline-flex items-center select-none">
            <Image
              src="/Immigroov_Transparent_Logo.png"
              alt="Immigroov"
              width={280}
              height={60}
              priority
              className="object-contain brightness-0 invert"
              style={{ height: '22px', width: 'auto' }}
            />
          </Link>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-accent-300 px-2.5 py-1 rounded-full bg-white/10 whitespace-nowrap">
            <Globe2 className="h-3 w-3" />
            20+ countries covered
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-3 overflow-x-auto">
          <button
            onClick={newChat}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold bg-accent-500 text-white shrink-0 active:scale-[0.98]"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            {UI_CONTENT.sidebar.newChat}
          </button>

          {nav.map(({ href, label, icon: Icon, gated }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={hrefFor(href, gated)}
                className={cn(
                  'inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-medium shrink-0',
                  active
                    ? 'bg-white/15 text-white'
                    : 'bg-white/[0.04] text-white/75',
                )}
              >
                <Icon className={cn('h-3.5 w-3.5', active ? 'text-accent-300' : 'text-white/60')} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Show menu' : 'Hide menu'}
        className="w-full flex items-center justify-center py-1 bg-white/5"
      >
        <ChevronDown className={cn('h-4 w-4 text-white/70 transition-transform', collapsed && 'rotate-180')} />
      </button>
    </div>
  );
}
