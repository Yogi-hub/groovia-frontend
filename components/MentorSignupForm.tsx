'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { createClient } from '../lib/supabase/client';

export function MentorSignupForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [headline, setHeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name;
      if (typeof fullName === 'string') setDisplayName(fullName);
    })();
  }, []);

  async function submit() {
    if (!displayName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('You need to be signed in.');
        return;
      }
      const res = await fetch('/api/mentor/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          display_name: displayName.trim(),
          headline: headline.trim() || undefined,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'Could not create your mentor profile. Please try again.');
        return;
      }
      router.refresh();
    } catch {
      setError('Could not create your mentor profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardBody className="pt-6 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Become a mentor</h2>
          <p className="text-sm text-muted mt-1">
            Create your mentor profile, then connect your calendar so candidates can book sessions with you.
          </p>
        </div>
        <Input
          label="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Jane Doe"
        />
        <Input
          label="Headline (optional)"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="e.g. Software engineer who moved from India to the Netherlands"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <Button variant="accent" onClick={submit} loading={submitting} disabled={!displayName.trim()}>
            Create mentor profile
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
