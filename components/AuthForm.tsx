'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../lib/supabase/client';
import { Card, CardBody } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { GoogleButton } from './GoogleButton';
import { getRecaptchaToken } from '../lib/recaptcha';
import { cn } from '../lib/utils';

type Role = 'candidate' | 'mentor';

interface Props {
  defaultRole?: Role;
}

export function AuthForm({ defaultRole = 'candidate' }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next') ?? undefined;
  const [role, setRole] = useState<Role>(defaultRole);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedMentor, setAgreedMentor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  const isMentor = role === 'mentor';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreedTerms) {
      setError('Please accept the Terms and Privacy Policy.');
      return;
    }
    if (isMentor && !agreedMentor) {
      setError('Please accept the Mentor Agreement to continue.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setLoading(true);

    const recaptchaToken = await getRecaptchaToken('signup').catch(() => null);
    if (recaptchaToken) {
      try {
        const r = await fetch('/api/auth/verify-recaptcha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: recaptchaToken }),
        });
        const { success } = await r.json();
        if (!success) {
          setLoading(false);
          setError('Verification failed. Please try again.');
          return;
        }
      } catch {
        // Fail open — don't block signup if verification is unreachable.
      }
    }

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

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (signUpError) {
      if (/already (registered|in use)/i.test(signUpError.message)) {
        router.push(`/login?email=${encodeURIComponent(email)}&reason=already_registered`);
        return;
      }
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      window.location.href = isMentor ? '/mentor' : (nextParam ?? '/chat');
      return;
    }
    setPendingVerification(true);
  }

  if (pendingVerification) {
    return (
      <Card>
        <CardBody className="pt-7">
          <h1 className="text-xl font-semibold tracking-tight text-brand-900">Check your inbox</h1>
          <p className="text-sm text-muted mt-2">
            We sent a verification link to <b>{email}</b>. After verifying, sign in to continue
            {isMentor ? ' setting up your mentor profile.' : '.'}
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="pt-7">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-brand-900">Create your account</h1>
          <p className="text-sm text-muted mt-1">
            {isMentor
              ? 'Join Immigroov as a mentor and start helping people achieve their goals.'
              : 'Free to start. No card required.'}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-brand-50 p-1">
          {(['candidate', 'mentor'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                'h-9 rounded-lg text-sm font-medium transition-colors',
                role === r ? 'bg-white text-brand-900 shadow-sm' : 'text-muted hover:text-foreground',
              )}
            >
              {r === 'candidate' ? 'User' : 'Mentor'}
            </button>
          ))}
        </div>

        <GoogleButton label="Continue with Google" next={isMentor ? '/mentor' : nextParam} />

        <div className="my-5 flex items-center gap-3 text-xs text-muted">
          <div className="h-px flex-1 bg-[--color-border]" />
          <span>or continue with email</span>
          <div className="h-px flex-1 bg-[--color-border]" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
            />
            <Input
              label="Last name"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
            />
          </div>
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
          <Input
            label="Confirm password"
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
          <label className="text-xs text-muted flex items-start gap-2 select-none">
            <input
              type="checkbox"
              className="mt-0.5 accent-[--color-brand-500]"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
            />
            <span>
              I agree to the{' '}
              <Link href="/terms" className="underline hover:text-foreground">Terms</Link> and{' '}
              <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
            </span>
          </label>
          {isMentor && (
            <label className="text-xs text-muted flex items-start gap-2 select-none">
              <input
                type="checkbox"
                className="mt-0.5 accent-[--color-brand-500]"
                checked={agreedMentor}
                onChange={(e) => setAgreedMentor(e.target.checked)}
              />
              <span>
                I agree to the Mentor Terms, Data Processing Agreement, and commission structure, and
                consent to anonymised session insights being used to improve Groovia.
              </span>
            </label>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button type="submit" variant={isMentor ? 'accent' : 'primary'} loading={loading}>
            {isMentor ? 'Create mentor account' : 'Create account'}
          </Button>
        </form>

        <p className="mt-4 text-xs text-muted text-center">
          Already have an account?{' '}
          <Link href={isMentor ? '/login?next=/mentor' : '/login'} className="text-brand-700 hover:underline">
            Sign in
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
