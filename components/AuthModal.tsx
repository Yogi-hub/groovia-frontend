'use client';
import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';
import { createClient } from '../lib/supabase/client';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { GoogleButton } from './GoogleButton';
import { getRecaptchaToken } from '../lib/recaptcha';
import { cn } from '../lib/utils';

type Role = 'candidate' | 'mentor';
type Mode = 'signup' | 'login';

function AuthModalInner() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const isOpen = params.get('auth') === 'open';
  const paramRole = params.get('role') === 'mentor' ? 'mentor' : 'candidate';
  const paramMode = params.get('mode') === 'login' ? 'login' : 'signup';
  const next = params.get('next') ?? undefined;

  const [role, setRole] = useState<Role>(paramRole);
  const [mode, setMode] = useState<Mode>(paramMode);
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

  // Reset form state each time the modal opens.
  useEffect(() => {
    if (isOpen) {
      setRole(paramRole);
      setMode(paramMode);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAgreedTerms(false);
      setAgreedMentor(false);
      setError(null);
      setPendingVerification(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function close() {
    const p = new URLSearchParams(params.toString());
    p.delete('auth');
    p.delete('role');
    p.delete('mode');
    p.delete('next');
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
  }

  const isMentor = role === 'mentor';

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!agreedTerms) { setError('Please accept the Terms and Privacy Policy.'); return; }
    if (isMentor && !agreedMentor) { setError('Please accept the Mentor Agreement.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
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
        if (!success) { setLoading(false); setError('Verification failed. Please try again.'); return; }
      } catch { /* fail open */ }
    }

    try {
      const r = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`, { cache: 'no-store' });
      const { exists } = await r.json();
      if (exists) {
        setLoading(false);
        setError('An account with this email already exists. Sign in instead?');
        return;
      }
    } catch { /* fail open */ }

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
        setError('An account with this email already exists. Sign in instead?');
        return;
      }
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      window.location.href = isMentor ? '/mentor' : (next ?? '/chat');
      return;
    }
    setPendingVerification(true);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (loginError) { setError(loginError.message); return; }
    window.location.href = isMentor ? '/mentor' : (next ?? '/chat');
  }

  if (!isOpen) return null;

  const googleNext = isMentor ? '/mentor' : next;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-900/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden animate-fade-up">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-muted hover:text-foreground hover:bg-black/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 sm:px-7 pt-7 pb-6">
          {pendingVerification ? (
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-brand-900">Check your inbox</h2>
              <p className="text-sm text-muted mt-2">
                We sent a verification link to <b>{email}</b>. After verifying, sign in to continue
                {isMentor ? ' setting up your mentor profile.' : '.'}
              </p>
              <button onClick={() => switchMode('login')} className="mt-4 text-sm text-brand-700 hover:underline">
                Sign in instead
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-5">
                <h2 className="text-2xl font-semibold tracking-tight text-brand-900">
                  {mode === 'signup' ? 'Create your account' : 'Welcome back'}
                </h2>
                <p className="text-sm text-muted mt-1">
                  {mode === 'signup'
                    ? (isMentor ? 'Join Immigroov as a mentor.' : 'Free to start. No card required.')
                    : 'Sign in to continue your journey.'}
                </p>
              </div>

              {/* Role toggle */}
              <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-brand-50 p-1">
                {(['candidate', 'mentor'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); setError(null); }}
                    className={cn(
                      'h-9 rounded-lg text-sm font-medium transition-colors',
                      role === r ? 'bg-white text-brand-900 shadow-sm' : 'text-muted hover:text-foreground',
                    )}
                  >
                    {r === 'candidate' ? 'User' : 'Mentor'}
                  </button>
                ))}
              </div>

              {/* Mode toggle */}
              <div className="mb-5 flex rounded-lg border border-[--color-border] overflow-hidden text-sm">
                {(['signup', 'login'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className={cn(
                      'flex-1 h-9 font-medium transition-colors',
                      mode === m ? 'bg-brand-900 text-white' : 'text-muted hover:text-foreground hover:bg-brand-50',
                    )}
                  >
                    {m === 'signup' ? 'Sign up' : 'Sign in'}
                  </button>
                ))}
              </div>

              <GoogleButton label="Continue with Google" next={googleNext} />

              <div className="my-4 flex items-center gap-3 text-xs text-muted">
                <div className="h-px flex-1 bg-[--color-border]" />
                <span>or with email</span>
                <div className="h-px flex-1 bg-[--color-border]" />
              </div>

              {mode === 'signup' ? (
                <form onSubmit={handleSignup} className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="First name" type="text" required value={firstName}
                      onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
                    <Input label="Last name" type="text" required value={lastName}
                      onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
                  </div>
                  <Input label="Email" type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                  <Input label="Password" type="password" required minLength={8} value={password}
                    onChange={(e) => setPassword(e.target.value)} autoComplete="new-password"
                    hint="At least 8 characters." />
                  <Input label="Confirm password" type="password" required minLength={8}
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password" />
                  <label className="text-xs text-muted flex items-start gap-2 select-none">
                    <input type="checkbox" className="mt-0.5 accent-[--color-brand-500]"
                      checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} />
                    <span>
                      I agree to the{' '}
                      <Link href="/terms" className="underline hover:text-foreground">Terms</Link> and{' '}
                      <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
                    </span>
                  </label>
                  {isMentor && (
                    <label className="text-xs text-muted flex items-start gap-2 select-none">
                      <input type="checkbox" className="mt-0.5 accent-[--color-brand-500]"
                        checked={agreedMentor} onChange={(e) => setAgreedMentor(e.target.checked)} />
                      <span>
                        I agree to the Mentor Terms, Data Processing Agreement, commission structure,
                        and consent to anonymised session insights improving Groovia.
                      </span>
                    </label>
                  )}
                  {error && (
                    <p className="text-xs text-red-600">
                      {error}{' '}
                      {error.includes('already exists') && (
                        <button type="button" onClick={() => switchMode('login')}
                          className="underline font-medium">Switch to sign in</button>
                      )}
                    </p>
                  )}
                  <Button type="submit" variant={isMentor ? 'accent' : 'primary'} loading={loading}>
                    {isMentor ? 'Create mentor account' : 'Create account'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="flex flex-col gap-3">
                  <Input label="Email" type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                  <Input label="Password" type="password" required value={password}
                    onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                  {error && <p className="text-xs text-red-600">{error}</p>}
                  <Button type="submit" loading={loading}>Sign in</Button>
                  <Link href="/forgot-password" className="text-xs text-muted text-center hover:text-foreground">
                    Forgot password?
                  </Link>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function AuthModal() {
  return (
    <Suspense fallback={null}>
      <AuthModalInner />
    </Suspense>
  );
}
