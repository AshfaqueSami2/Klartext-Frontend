'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, AlertCircle, RefreshCcw, Mail } from 'lucide-react';

export default function PaymentFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const tranId = searchParams.get('tranId');
  const error = searchParams.get('error');

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card className="relative overflow-hidden border-destructive">
          {/* Failed Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 -z-10" />

          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <XCircle className="w-24 h-24 text-red-500" />
                <AlertCircle className="w-8 h-8 text-orange-400 absolute -bottom-2 -right-2" />
              </div>
            </div>
            
            <CardTitle className="text-3xl md:text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
              Payment Failed
            </CardTitle>
            
            <CardDescription className="text-lg">
              We couldn't process your payment
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              Sorry, your payment could not be completed. This can happen for several reasons:
            </p>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm text-left">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>Insufficient funds in your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>Card expired or incorrect card details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>Payment gateway timeout or connection issue</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>Bank declined the transaction</span>
                </li>
              </ul>
            </div>

            {tranId && (
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Transaction ID (Failed)</p>
                <p className="text-sm font-mono font-semibold break-all text-red-600 dark:text-red-400">
                  {tranId}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Error Details</p>
                <p className="text-sm font-semibold text-destructive">{error}</p>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                💡 No money was deducted from your account
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button 
              onClick={() => router.push('/pricing')} 
              className="w-full"
              size="lg"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button 
                onClick={() => router.push('/contact')} 
                variant="outline"
                size="lg"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              
              <Button 
                onClick={() => router.push('/lessons')} 
                variant="outline"
                size="lg"
              >
                Back to Lessons
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Additional Help */}
        <div className="mt-8 text-center">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Need Immediate Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our support team is here to assist you with payment issues
              </p>
              <div className="space-y-2 text-sm">
                <p>📧 Email: support@klartext.com</p>
                <p>💬 Live Chat: Available 9 AM - 6 PM</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
