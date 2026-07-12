// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { validateEnv } from '@/utils/envValidator';

export async function GET() {
  // Validate required environment variables at runtime
  try {
    validateEnv();
  } catch (e) {
    return NextResponse.json({ status: 'error', message: (e as Error).message }, { status: 500 });
  }
  return NextResponse.json({ status: 'ok', timestamp: Date.now() }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}
