'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase/client';
import { Card, CardBody } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { GoogleButton } from '../../../components/GoogleButton';

function LoginForm() {
  const search = useSearchParams();
  const next = search.get('next') ?? '/chat';
  const prefilledEmail = search.get('email') ?? '';
  const reason = search.get('reason');

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Hard navigate so the server-rendered (shell) sees the new auth cookies immediately.
    // Avoids a stale `authed=false` render that would mis-trigger localStorage clearing.
    window.location.href = next;
  }

  return (
    <Card>
      <CardBody className="pt-7">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-brand-900">Welcome back</h1>
          <p className="text-sm text-muted mt-1">Sign in to continue your journey.</p>
        </div>

        {reason === 'already_registered' && (
          <div className="mb-5 px-3 py-2.5 rounded-lg bg-accent-50 border border-accent-200 text-xs text-accent-700">
            That email is already registered. Sign in below to continue.
          </div>
        )}
        {reason === 'idle' && (
          <div className="mb-5 px-3 py-2.5 rounded-lg bg-accent-50 border border-accent-200 text-xs text-accent-700">
            You were signed out due to inactivity. Sign in again to continue.
          </div>
        )}

        <GoogleButton next={next} />

        <div className="my-5 flex items-center gap-3 text-xs text-muted">
          <div className="h-px flex-1 bg-[--color-border]" />
          <span>or with email</span>
          <div className="h-px flex-1 bg-[--color-border]" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button type="submit" loading={loading}>Sign in</Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-muted">
          <Link href="/forgot-password" className="hover:text-foreground">Forgot password?</Link>
          <Link href="/signup" className="hover:text-foreground">Create account</Link>
        </div>
      </CardBody>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
