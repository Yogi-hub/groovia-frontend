'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Lock } from 'lucide-react';
import { Button } from './ui/Button';
import { UI_CONTENT } from '../lib/content';

interface Props {
  open: boolean;
}

export function SignupModal({ open }: Props) {
  // Lock body scroll while modal is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;
  const t = UI_CONTENT.signupModal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-900/40 backdrop-blur-sm animate-fade-up">
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl p-6 sm:p-7">
        <Image
          src="/Immigroov_Transparent_Logo.png"
          alt="Immigroov"
          width={280}
          height={60}
          className="object-contain mb-5"
          style={{ height: '26px', width: 'auto' }}
        />

        <h2 className="text-xl font-semibold tracking-tight text-brand-900">{t.title}</h2>
        <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{t.subtitle}</p>

        <div className="mt-6 flex flex-col gap-2">
          <Link href="/signup">
            <Button className="w-full">{t.createAccount}</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="w-full">{t.haveAccount}</Button>
          </Link>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted">
          <Lock className="h-3 w-3" />
          {t.requireAccount}
        </p>
      </div>
    </div>
  );
}
