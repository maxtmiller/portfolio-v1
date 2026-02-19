import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
});

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  console.log("Rate limiting for IP:", ip);
  
  const { success, limit, reset, remaining } = await ratelimit.limit(
    `ratelimit_${request.nextUrl.pathname}_${ip}`
  );

  if (!success) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. Take a breather!' }),
      { 
        status: 429, 
        headers: { 
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        } 
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/chat', '/api/trace', '/api/suggestion'],
}
