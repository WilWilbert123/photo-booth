import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    mode: 'offline-first',
    timestamp: new Date().toISOString(),
  });
}
