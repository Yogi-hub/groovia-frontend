import Link from 'next/link';
import { Logo } from '../../components/ui/Logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col hero-gradient">
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-fade-up">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          {children}
        </div>
      </main>
      <footer className="px-6 py-4 text-xs text-muted flex items-center justify-between">
        <span>© {new Date().getFullYear()} Immigroov</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
