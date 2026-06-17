import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardBody } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { BookingWidget } from '../../../../components/BookingWidget';
import type { Mentor } from '../../../../lib/types';
import { backendBaseUrl } from '../../../../lib/backend';
import { calBookingUrl } from '../../../../lib/constants';

async function fetchMentor(slug: string): Promise<Mentor | null> {
  try {
    const res = await fetch(`${backendBaseUrl()}/mentors/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function MentorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mentor = await fetchMentor(slug);
  if (!mentor) notFound();

  // Mentor has Nylas calendar → full Cal.com-like scheduler (mentor info lives in the widget's left panel)
  if (mentor.has_calendar) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <Link href="/mentors" className="text-sm text-muted hover:text-foreground inline-flex items-center gap-1 mb-8">
          ← All mentors
        </Link>
        <BookingWidget
          slug={mentor.slug}
          mentorName={mentor.display_name}
          headline={mentor.headline}
          bio={mentor.bio}
          durationMinutes={mentor.session_duration_minutes ?? 60}
        />
      </div>
    );
  }

  // Fallback: classic profile view with optional external booking link
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <Link href="/mentors" className="text-sm text-muted hover:text-foreground inline-flex items-center mb-6">
        ← All mentors
      </Link>

      <header className="flex flex-col gap-3 mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-brand-900">
          {mentor.display_name}
        </h1>
        {mentor.headline && (
          <p className="text-lg text-muted leading-relaxed">{mentor.headline}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {mentor.expertise_country_codes.map((c) => (
            <Badge key={c} tone="brand">{c}</Badge>
          ))}
          {mentor.expertise_categories.map((cat) => (
            <Badge key={cat} tone="accent">{cat}</Badge>
          ))}
          {mentor.languages.map((lang) => (
            <Badge key={lang} tone="neutral">{lang.toUpperCase()}</Badge>
          ))}
        </div>
      </header>

      {mentor.bio && (
        <Card className="mb-6">
          <CardBody className="pt-6">
            <h2 className="text-base font-semibold text-foreground mb-2">About</h2>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{mentor.bio}</p>
          </CardBody>
        </Card>
      )}

      {mentor.booking_url && (
        <Card className="bg-brand-50 border-brand-200">
          <CardBody className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-brand-900">Book a 1-on-1 session</h2>
              <p className="text-sm text-brand-900/70 mt-1">
                Direct time with {mentor.display_name.split(' ')[0]}.
              </p>
            </div>
            <a href={calBookingUrl(mentor.booking_url) ?? '#'} target="_blank" rel="noopener noreferrer">
              <Button variant="accent">Open booking page</Button>
            </a>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
