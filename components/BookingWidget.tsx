'use client';
import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, Loader2, Video } from 'lucide-react';
import { Card, CardBody } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { createClient } from '../lib/supabase/client';
import type { AvailabilitySlot } from '../lib/types';

interface Props {
  slug: string;
  mentorName: string;
}

interface BookingResult {
  meeting_url: string | null;
  mentor_local_time: string;
  candidate_local_time: string;
}

const candidateTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

function groupByDay(slots: AvailabilitySlot[]) {
  const groups = new Map<string, AvailabilitySlot[]>();
  for (const slot of slots) {
    const day = new Date(slot.start_time * 1000).toLocaleDateString(undefined, {
      timeZone: candidateTimeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const existing = groups.get(day);
    if (existing) existing.push(slot);
    else groups.set(day, [slot]);
  }
  return Array.from(groups.entries());
}

function formatTime(unixSeconds: number) {
  return new Date(unixSeconds * 1000).toLocaleTimeString(undefined, {
    timeZone: candidateTimeZone,
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function BookingWidget({ slug, mentorName }: Props) {
  const [slots, setSlots] = useState<AvailabilitySlot[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/mentors/${slug}/availability`, { cache: 'no-store' });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setLoadError(data.detail || 'Could not load availability for this mentor.');
          return;
        }
        setSlots(data.slots ?? []);
      } catch {
        if (!cancelled) setLoadError('Could not load availability for this mentor.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? '');
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
        if (typeof fullName === 'string') setName(fullName);
      }
    })();
  }, []);

  const dayGroups = useMemo(() => (slots ? groupByDay(slots) : []), [slots]);

  async function submitBooking() {
    if (!selectedSlot || !name.trim() || !email.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/mentors/${slug}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          start_time: selectedSlot.start_time,
          candidate_name: name.trim(),
          candidate_email: email.trim(),
          candidate_timezone: candidateTimeZone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.detail || 'Could not complete the booking. Please try another slot.');
        return;
      }
      setResult(data);
    } catch {
      setSubmitError('Could not complete the booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <Card className="bg-brand-50 border-brand-200">
        <CardBody className="pt-6">
          <h2 className="text-base font-semibold text-brand-900">Book a 1-on-1 session</h2>
          <p className="text-sm text-brand-900/70 mt-1">{loadError}</p>
        </CardBody>
      </Card>
    );
  }

  if (result) {
    return (
      <Card className="bg-brand-50 border-brand-200">
        <CardBody className="pt-6 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-brand-900">Session booked!</h2>
          </div>
          <p className="text-sm text-brand-900/80">
            Your session with {mentorName} is confirmed for <b>{result.candidate_local_time}</b> (your local time).
          </p>
          <p className="text-xs text-brand-900/60">
            A confirmation email is on its way to {email}.
          </p>
          {result.meeting_url && (
            <a
              href={result.meeting_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex"
            >
              <Button variant="accent">
                <Video className="h-4 w-4" />
                Join video call
              </Button>
            </a>
          )}
        </CardBody>
      </Card>
    );
  }

  if (!slots) {
    return (
      <Card className="bg-brand-50 border-brand-200">
        <CardBody className="pt-6 flex items-center gap-2 text-sm text-brand-900/70">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading available times…
        </CardBody>
      </Card>
    );
  }

  if (slots.length === 0) {
    return (
      <Card className="bg-brand-50 border-brand-200">
        <CardBody className="pt-6">
          <h2 className="text-base font-semibold text-brand-900">Book a 1-on-1 session</h2>
          <p className="text-sm text-brand-900/70 mt-1">
            {mentorName} has no open slots in the next two weeks. Please check back later.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="bg-brand-50 border-brand-200">
      <CardBody className="pt-6 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-brand-900">Book a 1-on-1 session</h2>
          <p className="text-sm text-brand-900/70 mt-1">
            Pick a time with {mentorName.split(' ')[0]}. Times are shown in your local timezone ({candidateTimeZone}).
          </p>
        </div>

        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
          {dayGroups.map(([day, daySlots]) => (
            <div key={day}>
              <p className="text-xs font-medium text-brand-900/60 mb-1.5">{day}</p>
              <div className="flex flex-wrap gap-2">
                {daySlots.map((slot) => (
                  <button
                    key={slot.start_time}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`h-9 px-3 text-sm rounded-md border transition-colors ${
                      selectedSlot?.start_time === slot.start_time
                        ? 'bg-brand-900 text-white border-brand-900'
                        : 'bg-white text-foreground border-[--color-border] hover:border-brand-300'
                    }`}
                  >
                    {formatTime(slot.start_time)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selectedSlot && (
          <div className="flex flex-col gap-3 pt-2 border-t border-brand-200/60">
            <p className="text-sm text-brand-900/80">
              Selected: <b>{formatTime(selectedSlot.start_time)}</b> on {dayGroups.find(([, s]) => s.includes(selectedSlot))?.[0]}
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                label="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
              />
              <Input
                label="Your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
              />
            </div>
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
            <div>
              <Button
                variant="accent"
                onClick={submitBooking}
                loading={submitting}
                disabled={!name.trim() || !email.trim()}
              >
                Confirm booking
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
