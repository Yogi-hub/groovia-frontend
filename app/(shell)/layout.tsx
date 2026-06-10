// Unified shell. Sidebar is always present; TopBar shows auth chip on the right.
// The main content is wrapped in PageTransition so navigating Chat ↔ Mentors ↔ Account
// fades in smoothly.
import { createClient } from '../../lib/supabase/server';
import { Sidebar } from '../../components/Sidebar';
import { TopBar } from '../../components/TopBar';
import { AuthGateRenderer } from '../../components/AuthGateRenderer';
import { PageTransition } from '../../components/PageTransition';

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen">
      <Sidebar authed={!!user} />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1 min-w-0">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <AuthGateRenderer authed={!!user} />
    </div>
  );
}
