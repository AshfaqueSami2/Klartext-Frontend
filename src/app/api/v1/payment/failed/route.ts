import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Get transaction details from query parameters
  const tranId = searchParams.get('tranId') || searchParams.get('tran_id');
  const error = searchParams.get('error') || searchParams.get('message');
  
  // Build redirect URL with query parameters
  const redirectUrl = new URL('/payment/failed', request.nextUrl.origin);
  
  if (tranId) redirectUrl.searchParams.set('tranId', tranId);
  if (error) redirectUrl.searchParams.set('error', error);
  
  // Redirect to the actual failed page
  return NextResponse.redirect(redirectUrl);
}

export async function POST(request: NextRequest) {
  // Handle POST requests from payment gateway
  const body = await request.json().catch(() => ({}));
  
  const tranId = body.tranId || body.tran_id;
  const error = body.error || body.message;
  
  // Build redirect URL with query parameters
  const redirectUrl = new URL('/payment/failed', request.nextUrl.origin);
  
  if (tranId) redirectUrl.searchParams.set('tranId', tranId);
  if (error) redirectUrl.searchParams.set('error', error);
  
  // Redirect to the actual failed page
  return NextResponse.redirect(redirectUrl);
}
