'use client';
import { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SignupModal } from './SignupModal';

interface Props {
  authed: boolean;
}

function GateInner({ authed }: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // Only guests can be gated. URL param `?signup=required` triggers the modal.
  const gated = !authed && params.get('signup') === 'required';

  function handleClose() {
    // Strip the param so the next gated click changes the URL and reopens the modal.
    const next = new URLSearchParams(params);
    next.delete('signup');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return <SignupModal open={gated} onClose={handleClose} />;
}

export function AuthGateRenderer(props: Props) {
  // Wrap in Suspense because useSearchParams forces dynamic rendering.
  return (
    <Suspense fallback={null}>
      <GateInner {...props} />
    </Suspense>
  );
}
