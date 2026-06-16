import { redirect } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/server';
import { backendBaseUrl } from '../../../../lib/backend';
import { MentorAvailabilityForm } from '../../../../components/MentorAvailabilityForm';

export const metadata = { title: 'Availability — Immigroov Mentor' };

interface MentorMe {
  id: string;
  status: string;
  nylas_email: string | null;
  session_duration_minutes: number | null;
}

interface AvailabilityResponse {
  slots: Array<{ day_of_week: number; start_time: string; end_time: string }>;
  session_duration_minutes: number;
  availability_type: string | null;
}

export default async function MentorAvailabilityPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/?auth=open&role=mentor&next=${encodeURIComponent('/mentor/availability')}`);
  }

  const mentorRes = await fetch(`${backendBaseUrl()}/mentor/me`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: 'no-store',
  });

  if (!mentorRes.ok) {
    redirect('/mentor/onboarding');
  }

  const mentor: MentorMe = await mentorRes.json();

  if (mentor.status !== 'approved') {
    redirect('/mentor');
  }

  const availRes = await fetch(`${backendBaseUrl()}/mentor/availability`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: 'no-store',
  });

  const availability: AvailabilityResponse = availRes.ok
    ? await availRes.json()
    : { slots: [], session_duration_minutes: mentor.session_duration_minutes ?? 60, availability_type: null };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-brand-900">Availability</h1>
      <p className="text-sm text-muted mt-1">
        Set the times when mentees can book sessions with you.
      </p>
      <div className="mt-8">
        <MentorAvailabilityForm
          initialSlots={availability.slots}
          initialDuration={availability.session_duration_minutes}
          calendarEmail={mentor.nylas_email}
        />
      </div>
    </div>
  );
}
