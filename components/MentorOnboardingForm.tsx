'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../lib/supabase/client';
import { Card, CardBody } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { MultiSelect } from './ui/MultiSelect';
import { COUNTRIES } from '../lib/countries';
import { LANGUAGES } from '../lib/languages';
import { cn } from '../lib/utils';

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.code, label: c.name }));
const LANGUAGE_OPTIONS = LANGUAGES.map((l) => ({ value: l.code, label: l.name }));

const DOMAIN_OPTIONS = [
  'Software Engineering', 'Product Management', 'Data Science & AI', 'Design (UX/UI)',
  'Marketing', 'Sales', 'Finance & Banking', 'Healthcare', 'Legal', 'Education',
  'Entrepreneurship', 'Operations', 'HR & Recruiting', 'Consulting', 'Research',
  'Manufacturing', 'Real Estate', 'Media & Journalism', 'Government & Policy', 'Non-profit',
].map((d) => ({ value: d, label: d }));

const DURATION_OPTIONS = [
  { minutes: 30, label: '30 min' },
  { minutes: 60, label: '60 min' },
  { minutes: 90, label: '90 min' },
];

interface Props {
  defaultName?: string;
}

export function MentorOnboardingForm({ defaultName = '' }: Props) {
  const router = useRouter();

  const [displayName, setDisplayName] = useState(defaultName);
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [countries, setCountries] = useState<string[]>([]);
  const [yearsExp, setYearsExp] = useState('');
  const [domains, setDomains] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [sessionDuration, setSessionDuration] = useState(60);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [agreedMentor, setAgreedMentor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) { setError('Display name is required.'); return; }
    if (countries.length === 0) { setError('Select at least one country of expertise.'); return; }
    if (languages.length === 0) { setError('Select at least one language.'); return; }
    const years = parseInt(yearsExp, 10);
    if (!yearsExp || isNaN(years) || years < 0) { setError('Enter your years of lived experience.'); return; }
    if (!agreedMentor) { setError('Please accept the Mentor Agreement.'); return; }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setError('Session expired. Please sign in again.'); return; }

      const res = await fetch('/api/mentor/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          display_name: displayName.trim(),
          headline: headline.trim() || undefined,
          bio: bio.trim() || undefined,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          expertise_country_codes: countries,
          languages,
          professional_domains: domains,
          years_lived_experience: years,
          session_duration_minutes: sessionDuration,
          linkedin_url: linkedinUrl.trim() || undefined,
          youtube_url: youtubeUrl.trim() || undefined,
          instagram_url: instagramUrl.trim() || undefined,
          agreed_to_mentor_terms: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'Something went wrong. Please try again.');
        return;
      }
      router.push('/mentor');
      router.refresh();
    } catch {
      setError('Could not create your mentor profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      {/* Basic info */}
      <Card>
        <CardBody className="pt-6 flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Basic info</h2>
            <p className="text-sm text-muted mt-0.5">How you&apos;ll appear to users browsing mentors.</p>
          </div>
          <Input
            label="Display name *"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Jane Doe"
            required
          />
          <Input
            label="Headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Software engineer who moved from India to the Netherlands"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell prospective mentees about your immigration journey, your current role, and what kind of help you can offer…"
              className={cn(
                'px-3 py-2 rounded-lg bg-white text-sm text-foreground resize-y',
                'placeholder:text-muted',
                'shadow-[0_0_0_1px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)]',
                'focus:outline-none focus:shadow-[0_0_0_2px_rgba(29,78,216,0.25),0_1px_2px_rgba(15,23,42,0.04)]',
              )}
            />
          </div>
        </CardBody>
      </Card>

      {/* Expertise */}
      <Card>
        <CardBody className="pt-6 flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Expertise</h2>
            <p className="text-sm text-muted mt-0.5">
              These fields determine who you can best mentor. Changes here will require re-approval.
            </p>
          </div>
          <MultiSelect
            label="Countries of expertise *"
            options={COUNTRY_OPTIONS}
            value={countries}
            onChange={setCountries}
            placeholder="Select countries…"
            hint="Countries you have direct immigration experience in."
          />
          <Input
            label="Years of lived experience *"
            type="number"
            min={0}
            max={60}
            value={yearsExp}
            onChange={(e) => setYearsExp(e.target.value)}
            placeholder="e.g. 5"
            hint="Total years you have lived abroad as an immigrant."
          />
          <MultiSelect
            label="Professional domains"
            options={DOMAIN_OPTIONS}
            value={domains}
            onChange={setDomains}
            placeholder="Select domains…"
            hint="Industries or roles you can advise on."
          />
        </CardBody>
      </Card>

      {/* Languages & sessions */}
      <Card>
        <CardBody className="pt-6 flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Languages & sessions</h2>
          </div>
          <MultiSelect
            label="Languages you mentor in *"
            options={LANGUAGE_OPTIONS}
            value={languages}
            onChange={setLanguages}
            placeholder="Select languages…"
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Session duration</span>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map(({ minutes, label }) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => setSessionDuration(minutes)}
                  className={cn(
                    'flex-1 h-10 rounded-lg border text-sm font-medium transition-colors',
                    sessionDuration === minutes
                      ? 'bg-brand-600 border-brand-600 text-white'
                      : 'border-[--color-border] text-muted hover:text-foreground hover:border-brand-300',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Social links */}
      <Card>
        <CardBody className="pt-6 flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Social links</h2>
            <p className="text-sm text-muted mt-0.5">Optional — helps mentees learn more about you.</p>
          </div>
          <Input
            label="LinkedIn URL"
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/yourname"
          />
          <Input
            label="YouTube URL"
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/@yourchannel"
          />
          <Input
            label="Instagram URL"
            type="url"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://instagram.com/yourhandle"
          />
        </CardBody>
      </Card>

      {/* Agreement & submit */}
      <Card>
        <CardBody className="pt-6 flex flex-col gap-4">
          <label className="text-sm text-muted flex items-start gap-2 select-none cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 accent-[--color-brand-500]"
              checked={agreedMentor}
              onChange={(e) => setAgreedMentor(e.target.checked)}
            />
            <span>
              I agree to the{' '}
              <Link href="/mentor-terms" className="underline hover:text-foreground">
                Mentor Agreement
              </Link>
              , Data Processing Agreement, and commission structure. I consent to anonymised session
              insights being used to improve Groovia.
            </span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" variant="accent" loading={submitting}>
            Submit application
          </Button>
          <p className="text-xs text-muted">
            Your profile will be reviewed by our team before going live. This usually takes 1–2 business days.
          </p>
        </CardBody>
      </Card>
    </form>
  );
}
