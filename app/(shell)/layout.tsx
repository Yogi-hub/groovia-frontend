import { createClient } from '../../lib/supabase/server';
import { Sidebar } from '../../components/Sidebar';
import { MobileNav } from '../../components/MobileNav';
import { TopBar } from '../../components/TopBar';
import { AuthGateRenderer } from '../../components/AuthGateRenderer';
import { PageTransition } from '../../components/PageTransition';
import { IdleLogout } from '../../components/IdleLogout';

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <MobileNav authed={!!user} />
      <Sidebar authed={!!user} />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 min-h-0 overflow-y-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <AuthGateRenderer authed={!!user} />
      <IdleLogout authed={!!user} />
    </div>
  );
}
