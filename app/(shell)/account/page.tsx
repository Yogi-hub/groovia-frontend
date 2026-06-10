import { createClient } from '../../../lib/supabase/server';
import { Card, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export const metadata = { title: 'Account — Immigroov' };

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, country_code, target_country_code, profession, immigration_goal, credit_balance, role, created_at')
    .eq('id', user!.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-brand-900">Account</h1>
      <p className="text-sm text-muted mt-1">Your profile and platform info.</p>

      <div className="mt-8 grid gap-4">
        <Card>
          <CardBody className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">{profile?.full_name ?? '—'}</h2>
                <p className="text-sm text-muted">{profile?.email}</p>
              </div>
              <Badge tone="brand">{profile?.role}</Badge>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="pt-6">
            <h2 className="text-base font-semibold text-foreground mb-3">Profile</h2>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-muted">Current country</dt>
              <dd>{profile?.country_code ?? '—'}</dd>
              <dt className="text-muted">Target country</dt>
              <dd>{profile?.target_country_code ?? '—'}</dd>
              <dt className="text-muted">Profession</dt>
              <dd>{profile?.profession ?? '—'}</dd>
              <dt className="text-muted">Immigration goal</dt>
              <dd>{profile?.immigration_goal ?? '—'}</dd>
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="pt-6">
            <h2 className="text-base font-semibold text-foreground">Credits</h2>
            <p className="text-3xl font-semibold text-accent-600 mt-1">{profile?.credit_balance ?? 0}</p>
            <p className="text-xs text-muted mt-2">
              Credits unlock premium Groovia features (CV rewrite, Sponsor Radar, etc.). Coming in a later slice.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
