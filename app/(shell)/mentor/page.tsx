import { Suspense } from 'react';
import { createClient } from '../../../lib/supabase/server';
import { backendBaseUrl } from '../../../lib/backend';
import { ConnectCalendar } from '../../../components/ConnectCalendar';
import { MentorSignupForm } from '../../../components/MentorSignupForm';
import { AuthForm } from '../../../components/AuthForm';
import { Card, CardBody } from '../../../components/ui/Card';

export const metadata = { title: 'Join as Mentor — Immigroov' };

interface MentorMe {
  id: string;
  slug: string;
  display_name: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'suspended';
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

      <div className="mt-8 flex flex-col gap-4">
        {!session ? (
          <Suspense fallback={null}>
            <AuthForm defaultRole="mentor" />
          </Suspense>
        ) : !mentor ? (
          <MentorSignupForm />
        ) : (
          <>
            {mentor.status === 'pending_review' && (
              <Card>
                <CardBody className="pt-6">
                  <h2 className="text-base font-semibold text-foreground">Application under review</h2>
                  <p className="text-sm text-muted mt-1">
                    Thanks for applying to become a mentor. Our team is reviewing your application.
                    Once approved, you&apos;ll be able to connect your calendar and start accepting bookings.
                  </p>
                </CardBody>
              </Card>
            )}
            {mentor.status === 'rejected' && (
              <Card>
                <CardBody className="pt-6">
                  <h2 className="text-base font-semibold text-foreground">Application not approved</h2>
                  <p className="text-sm text-muted mt-1">
                    Your mentor application wasn&apos;t approved. If you think this is a mistake, please
                    contact support.
                  </p>
                </CardBody>
              </Card>
            )}
            {mentor.status === 'suspended' && (
              <Card>
                <CardBody className="pt-6">
                  <h2 className="text-base font-semibold text-foreground">Account suspended</h2>
                  <p className="text-sm text-muted mt-1">
                    Your mentor account is currently suspended. Please contact support for more information.
                  </p>
                </CardBody>
              </Card>
            )}
            {mentor.status === 'approved' && (
              <ConnectCalendar
                mentorName={mentor.display_name}
                nylasEmail={mentor.nylas_email}
                connectedAt={mentor.calendar_connected_at}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
