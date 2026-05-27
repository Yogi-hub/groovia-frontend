// Server-side API proxy route for backend communication
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const incomingData = await request.formData();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/chat';

    const upstreamResponse = await fetch(backendUrl, {
      method: 'POST',
      body: incomingData,
    });

    if (!upstreamResponse.ok) {
      const errorPayload = await upstreamResponse.text();
      return new NextResponse(errorPayload, { status: upstreamResponse.status });
    }

    const payload = await upstreamResponse.json();
    return NextResponse.json(payload);
  } catch (err: any) {
    return new NextResponse(err.message, { status: 500 });
  }
}