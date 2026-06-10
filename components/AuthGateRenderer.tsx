'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SignupModal } from './SignupModal';

interface Props {
  authed: boolean;
}

function GateInner({ authed }: Props) {
  const params = useSearchParams();
  // Only guests can be gated. URL param `?signup=required` triggers the modal.
  const gated = !authed && params.get('signup') === 'required';
  return <SignupModal open={gated} />;
}

export function AuthGateRenderer(props: Props) {
  // Wrap in Suspense because useSearchParams forces dynamic rendering.
  return (
    <Suspense fallback={null}>
      <GateInner {...props} />
    </Suspense>
  );
}
