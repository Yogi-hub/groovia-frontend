import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { backendBaseUrl } from '../../../lib/backend';
import { AdminMentorList } from '../../../components/AdminMentorList';
import { UI_CONTENT } from '../../../lib/content';

export const metadata = { title: 'Admin — Immigroov' };

export interface PendingMentor {
  id: string;
  slug: string;
  display_name: string;
  headline: string | null;
  status: string;
  created_at: string;
  email: string | null;
  full_name: string | null;
}

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/login?next=/admin');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') redirect('/chat');

  let mentors: PendingMentor[] = [];
  try {
    const res = await fetch(`${backendBaseUrl()}/admin/mentors/pending`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: 'no-store',
    });
    if (res.ok) mentors = await res.json();
  } catch {
    // Render empty list if backend is unreachable — component shows empty state.
  }

  const t = UI_CONTENT.admin;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-brand-900">{t.title}</h1>
      <p className="text-sm text-muted mt-1">{t.subtitle}</p>
      <div className="mt-8">
        <AdminMentorList initialMentors={mentors} />
      </div>
    </div>
  );
}
