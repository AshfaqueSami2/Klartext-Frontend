import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Get transaction details from query parameters
  const tranId = searchParams.get('tranId') || searchParams.get('tran_id');
  const plan = searchParams.get('plan');
  const status = searchParams.get('status');
  
  // Build redirect URL with query parameters
  const redirectUrl = new URL('/payment/success', request.nextUrl.origin);
  
  if (tranId) redirectUrl.searchParams.set('tranId', tranId);
  if (plan) redirectUrl.searchParams.set('plan', plan);
  if (status) redirectUrl.searchParams.set('status', status);
  
  // Redirect to the actual success page
  return NextResponse.redirect(redirectUrl);
}

export async function POST(request: NextRequest) {
  // Handle POST requests from payment gateway
  const body = await request.json().catch(() => ({}));
  
  const tranId = body.tranId || body.tran_id;
  const plan = body.plan;
  const status = body.status;
  
  // Build redirect URL with query parameters
  const redirectUrl = new URL('/payment/success', request.nextUrl.origin);
  
  if (tranId) redirectUrl.searchParams.set('tranId', tranId);
  if (plan) redirectUrl.searchParams.set('plan', plan);
  if (status) redirectUrl.searchParams.set('status', status);
  
  // Redirect to the actual success page
  return NextResponse.redirect(redirectUrl);
}
