// BFF proxy: ask the backend whether this email is already registered.
import { NextRequest, NextResponse } from 'next/server';
import { backendBaseUrl } from '../../../../lib/backend';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) return NextResponse.json({ exists: false }, { status: 400 });

  try {
    const url = `${backendBaseUrl()}/auth/check-email?email=${encodeURIComponent(email)}`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    // Fail open — if backend is down, let the signup flow proceed and rely on Supabase.
    return NextResponse.json({ exists: false }, { status: 200 });
  }
}
