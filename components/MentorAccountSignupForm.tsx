'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardBody } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { createClient } from '../lib/supabase/client';

export function MentorAccountSignupForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || password.length < 8) return;
    setSubmitting(true);
    setError(null);

    try {
      const r = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`, { cache: 'no-store' });
      const { exists } = await r.json();
      if (exists) {
        setError('An account with this email already exists. Please sign in instead.');
        return;
      }
    } catch {
      // Fail open — continue with Supabase signUp.
    }

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: 'mentor' } },
    });
    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }
    if (!data.session) {
      setPendingVerification(true);
      setSubmitting(false);
      return;
    }

    try {
      const signupRes = await fetch('/api/mentor/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({
          display_name: fullName.trim(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      if (!signupRes.ok) {
        const body = await signupRes.json();
        setError(body.detail || 'Account created, but we could not set up your mentor profile. Please refresh and try again.');
        setSubmitting(false);
        return;
      }

      const redirectUri = `${window.location.origin}/api/nylas/callback`;
      const connectRes = await fetch(`/api/mentor/nylas/connect-url?redirect_uri=${encodeURIComponent(redirectUri)}`, {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      const connectData = await connectRes.json();
      if (connectRes.ok && connectData.url) {
        window.location.href = connectData.url;
        return;
      }
      window.location.href = '/mentor';
    } catch {
      setError('Account created, but something went wrong setting up your mentor profile. Please refresh and try again.');
      setSubmitting(false);
    }
  }

  if (pendingVerification) {
    return (
      <Card>
        <CardBody className="pt-6">
          <h2 className="text-base font-semibold text-foreground">Check your inbox</h2>
          <p className="text-sm text-muted mt-1">
            We sent a verification link to <b>{email}</b>. After verifying, come back to this page to connect your calendar.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="pt-6 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Join as a mentor</h2>
          <p className="text-sm text-muted mt-1">
            Create your mentor account, then connect your calendar so candidates can book sessions with you.
          </p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Input
            label="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            autoComplete="name"
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            hint="At least 8 characters."
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <Button type="submit" variant="accent" loading={submitting} disabled={!fullName.trim() || !email.trim() || password.length < 8}>
              Create mentor account &amp; connect calendar
            </Button>
          </div>
        </form>
        <p className="text-xs text-muted">
          Already have a mentor account?{' '}
          <Link href="/login?next=/mentor" className="text-brand-700 hover:underline">Sign in</Link>
        </p>
      </CardBody>
    </Card>
  );
}
