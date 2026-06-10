'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase/client';
import { Card, CardBody } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { GoogleButton } from '../../../components/GoogleButton';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      setError('Please accept the Terms and Privacy Policy.');
      return;
    }
    setError(null);
    setLoading(true);

    // Backend check first — works around Supabase's email-enumeration protection
    // so duplicates get routed cleanly to /login instead of silently failing.
    try {
      const r = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`, {
        cache: 'no-store',
      });
      const { exists } = await r.json();
      if (exists) {
        setLoading(false);
        router.push(`/login?email=${encodeURIComponent(email)}&reason=already_registered`);
        return;
      }
    } catch {
      // Fail open — continue with Supabase signUp.
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      // Supabase may also return a duplicate error if enumeration protection is off.
      if (/already (registered|in use)/i.test(error.message)) {
        router.push(`/login?email=${encodeURIComponent(email)}&reason=already_registered`);
        return;
      }
      setError(error.message);
      return;
    }
    // If email confirmation is disabled in Supabase, signUp returns a session immediately.
    if (data.session) {
      window.location.href = '/chat';
      return;
    }
    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  return (
    <Card>
      <CardBody className="pt-7">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-brand-900">Create your account</h1>
          <p className="text-sm text-muted mt-1">Free to start. No card required.</p>
        </div>

        <GoogleButton label="Sign up with Google" />

        <div className="my-5 flex items-center gap-3 text-xs text-muted">
          <div className="h-px flex-1 bg-[--color-border]" />
          <span>or with email</span>
          <div className="h-px flex-1 bg-[--color-border]" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full name"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            hint="At least 8 characters."
          />
          <label className="text-xs text-muted flex items-start gap-2 select-none">
            <input
              type="checkbox"
              className="mt-0.5 accent-[--color-brand-500]"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>
              I agree to the{' '}
              <Link href="/terms" className="underline hover:text-foreground">Terms</Link> and{' '}
              <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
            </span>
          </label>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button type="submit" loading={loading}>Create account</Button>
        </form>

        <p className="mt-4 text-xs text-muted text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-700 hover:underline">Sign in</Link>
        </p>
      </CardBody>
    </Card>
  );
}
