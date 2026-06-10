import ChatInterface from '../../../components/ChatInterface';
import { createClient } from '../../../lib/supabase/server';

export const metadata = { title: 'Chat — Immigroov' };

// `?t=...` from the sidebar's "New chat" button forces a remount with a fresh thread_id.
export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <ChatInterface key={t ?? 'main'} authed={!!user} />;
}
