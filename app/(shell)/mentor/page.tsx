import { createClient } from '../../../lib/supabase/server';
import { backendBaseUrl } from '../../../lib/backend';
import { ConnectCalendar } from '../../../components/ConnectCalendar';
import { MentorSignupForm } from '../../../components/MentorSignupForm';
import { MentorAccountSignupForm } from '../../../components/MentorAccountSignupForm';

export const metadata = { title: 'Join as Mentor — Immigroov' };

interface MentorMe {
  id: string;
  slug: string;
  display_name: string;
  nylas_grant_id: string | null;
  nylas_email: string | null;
  calendar_connected_at: string | null;
}

export default async function MentorPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  let mentor: MentorMe | null = null;
  if (session?.access_token) {
    const res = await fetch(`${backendBaseUrl()}/mentor/me`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: 'no-store',
    });
    if (res.ok) mentor = await res.json();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-brand-900">Join as Mentor</h1>
      <p className="text-sm text-muted mt-1">Connect your calendar so candidates can book sessions with you.</p>

      <div className="mt-8">
        {!session ? (
          <MentorAccountSignupForm />
        ) : mentor ? (
          <ConnectCalendar
            mentorName={mentor.display_name}
            nylasEmail={mentor.nylas_email}
            connectedAt={mentor.calendar_connected_at}
          />
        ) : (
          <MentorSignupForm />
        )}
      </div>
    </div>
  );
}
