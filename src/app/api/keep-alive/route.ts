import { NextResponse } from 'next/server';

// This endpoint pings the backend to keep it warm
export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    
    // Simple health check ping
    await fetch(`${backendUrl}/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    }).catch(() => null); // Ignore errors
    
    return NextResponse.json({ status: 'ok', pinged: backendUrl });
  } catch (error) {
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
