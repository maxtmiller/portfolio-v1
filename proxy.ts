import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const trackers: Record<string, { count: number; lastReset: number }> = {};

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/chat')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] 
               || request.headers.get('x-real-ip') 
               || '127.0.0.1';
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 5;

    if (!trackers[ip]) {
      trackers[ip] = { count: 1, lastReset: now };
    } else {
      if (now - trackers[ip].lastReset > windowMs) {
        trackers[ip] = { count: 1, lastReset: now };
      } else {
        trackers[ip].count++;
      }
    }

    if (trackers[ip].count > maxRequests) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Take a breather!' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/chat'],
}