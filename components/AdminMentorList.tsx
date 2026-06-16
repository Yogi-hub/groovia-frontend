'use client';
import { useState } from 'react';
import { createClient } from '../lib/supabase/client';
import { Card, CardBody } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { UI_CONTENT } from '../lib/content';
import type { PendingMentor } from '../app/(shell)/admin/page';

interface Props {
  initialMentors: PendingMentor[];
}

export function AdminMentorList({ initialMentors }: Props) {
  const [mentors, setMentors] = useState(initialMentors);
  const [pending, setPending] = useState<Record<string, 'approving' | 'rejecting'>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function act(id: string, action: 'approve' | 'reject') {
    setPending((p) => ({ ...p, [id]: action === 'approve' ? 'approving' : 'rejecting' }));
    setErrors((e) => { const n = { ...e }; delete n[id]; return n; });
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/admin/mentors/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
      });
      if (res.ok) {
        setMentors((ms) => ms.filter((m) => m.id !== id));
      } else {
        const body = await res.json().catch(() => ({}));
        setErrors((e) => ({ ...e, [id]: body.detail || `Failed to ${action}. Please try again.` }));
      }
    } catch {
      setErrors((e) => ({ ...e, [id]: `Failed to ${action}. Please try again.` }));
    } finally {
      setPending((p) => { const n = { ...p }; delete n[id]; return n; });
    }
  }

  const t = UI_CONTENT.admin;

  if (mentors.length === 0) {
    return <p className="text-sm text-muted">{t.empty}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {mentors.map((mentor) => (
        <Card key={mentor.id}>
          <CardBody className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-semibold text-foreground">{mentor.display_name}</h2>
                  <Badge tone="neutral">{mentor.status.replace('_', ' ')}</Badge>
                  {mentor.submission_count > 1 && (
                    <Badge tone="warning">Re-submission #{mentor.submission_count}</Badge>
                  )}
                </div>
                {mentor.headline && (
                  <p className="text-sm text-muted mt-0.5">{mentor.headline}</p>
                )}
                <p className="text-xs text-muted mt-1">
                  {mentor.email ?? '—'}
                  {mentor.full_name ? ` · ${mentor.full_name}` : ''}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  Applied {new Date(mentor.created_at).toLocaleDateString()}
                </p>
                {errors[mentor.id] && (
                  <p className="text-xs text-red-600 mt-1">{errors[mentor.id]}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  loading={pending[mentor.id] === 'rejecting'}
                  disabled={!!pending[mentor.id]}
                  onClick={() => act(mentor.id, 'reject')}
                >
                  {t.reject}
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  loading={pending[mentor.id] === 'approving'}
                  disabled={!!pending[mentor.id]}
                  onClick={() => act(mentor.id, 'approve')}
                >
                  {t.approve}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
