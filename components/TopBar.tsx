// TopBar — fixed at the top of the main content area in the (shell) layout.
// Right-aligned auth chip: shows email + sign-out for authed users, "Sign in" for guests.
// Server component; reads user from the Supabase server client.
import { createClient } from '../lib/supabase/server';
import { TopBarClient } from './TopBarClient';

export async function TopBar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <TopBarClient email={user?.email ?? null} />;
}
