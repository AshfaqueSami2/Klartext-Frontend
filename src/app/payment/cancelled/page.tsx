'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, RefreshCcw } from 'lucide-react';

export default function PaymentCancelledPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const tranId = searchParams.get('tranId');

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card className="relative overflow-hidden border-orange-300 dark:border-orange-800">
          {/* Cancelled Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 -z-10" />

          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <AlertTriangle className="w-24 h-24 text-orange-500" />
              </div>
            </div>
            
            <CardTitle className="text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              Payment Cancelled
            </CardTitle>
            
            <CardDescription className="text-lg">
              You cancelled the payment process
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground text-lg">
              No worries! You can try again whenever you're ready.
            </p>

            {tranId && (
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Transaction ID (Cancelled)</p>
                <p className="text-sm font-mono font-semibold break-all text-orange-600 dark:text-orange-400">
                  {tranId}
                </p>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                💡 No charges were made to your account
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-3">Why upgrade?</h3>
              <ul className="text-left space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Access to advanced B1, B2, C1, C2 lessons</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Unlimited audio content and translations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Track your progress and earn certificates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Priority support from our team</span>
                </li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button 
              onClick={() => router.push('/pricing')} 
              className="w-full"
              size="lg"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              View Plans Again
            </Button>
            
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button 
                onClick={() => router.push('/lessons')} 
                variant="outline"
                size="lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Lessons
              </Button>
              
              <Button 
                onClick={() => router.push('/dashboard')} 
                variant="outline"
                size="lg"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Still have questions?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We're here to help! Contact our support team for any payment-related questions.
              </p>
              <Button 
                onClick={() => router.push('/contact')}
                variant="outline"
              >
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Continue Learning with Free Content */}
        <div className="mt-6 text-center">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">🎉 Free Access Still Available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Don't forget! You can continue learning with our free A1 and A2 lessons anytime.
              </p>
              <Button 
                onClick={() => router.push('/lessons?level=A1')}
                variant="default"
              >
                Browse Free Lessons
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
