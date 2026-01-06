'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { paymentService } from '@/services/payment.service';
import { useSubscription } from '@/context/SubscriptionContext';
import api from '@/lib/axios';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSubscription } = useSubscription();
  const [countdown, setCountdown] = useState(5);
  const [verifying, setVerifying] = useState(true);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  const tranId = searchParams.get('tranId');
  const plan = searchParams.get('plan');

  // Refresh all user data after payment
  const refreshAllUserData = async () => {
    try {
      // Call all three APIs in parallel to refresh data
      await Promise.all([
        api.get('/subscription/status'),
        api.get('/analytics/dashboard'),
        api.get('/progress/my-progress'),
      ]);
      console.log('✅ All user data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Verify subscription status after payment
  useEffect(() => {
    const verifySubscription = async () => {
      try {
        // Wait a bit for backend to process payment
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Refresh all user data from backend
        await refreshAllUserData();
        
        // Check subscription status
        const status = await paymentService.getSubscriptionStatus();
        
        if (status.isPremium) {
          setSubscriptionActive(true);
          setVerifying(false);
          
          // Refresh global subscription context
          await refreshSubscription();
          
          console.log('🎉 Subscription activated successfully!');
        } else {
          // If not premium yet, retry a few times
          if (verificationAttempts < 5) {
            setVerificationAttempts(prev => prev + 1);
            setTimeout(() => verifySubscription(), 2000);
          } else {
            setVerifying(false);
            console.warn('⚠️ Subscription not activated after multiple attempts');
          }
        }
      } catch (error) {
        console.error('Error verifying subscription:', error);
        if (verificationAttempts < 5) {
          setVerificationAttempts(prev => prev + 1);
          setTimeout(() => verifySubscription(), 2000);
        } else {
          setVerifying(false);
        }
      }
    };

    verifySubscription();
  }, [verificationAttempts, refreshSubscription]);

  // Handle countdown timer (only if subscription is active)
  useEffect(() => {
    if (!subscriptionActive || verifying) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [subscriptionActive, verifying]);

  // Handle navigation when countdown reaches 0
  useEffect(() => {
    if (countdown <= 0 && subscriptionActive) {
      router.push('/dashboard');
    }
  }, [countdown, subscriptionActive, router]);

  // Manual refresh handler
  const handleRefresh = async () => {
    setVerifying(true);
    setVerificationAttempts(0);
    
    // Refresh all data
    await refreshAllUserData();
    await refreshSubscription();
    
    // Reload the page to ensure fresh data everywhere
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Verification Status */}
        {verifying && (
          <Card className="mb-6 border-blue-300 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <p className="font-semibold text-blue-800 dark:text-blue-300">
                    Verifying your subscription...
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Please wait while we activate your premium access
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warning if subscription not activated */}
        {!verifying && !subscriptionActive && (
          <Card className="mb-6 border-orange-300 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-orange-800 dark:text-orange-300 mb-2">
                      Subscription Activation Pending
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-400 mb-3">
                      Your payment was successful, but your subscription is still being activated. This usually takes a few moments.
                    </p>
                    <ul className="text-sm text-orange-700 dark:text-orange-400 space-y-1 mb-4">
                      <li>• Payment processing may take 1-2 minutes</li>
                      <li>• Try refreshing this page in a moment</li>
                      <li>• If issue persists after 5 minutes, contact support with Transaction ID: {tranId}</li>
                    </ul>
                    <Button 
                      onClick={handleRefresh}
                      size="sm"
                      variant="outline"
                      className="border-orange-300 text-orange-700 hover:bg-orange-100"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Status
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="relative overflow-hidden">
          {/* Success Animation Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 -z-10" />
          
          {/* Confetti Effect */}
          <div className="absolute inset-0 overflow-hidden -z-10">
            <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            <div className="absolute top-0 left-3/4 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
          </div>

          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <CheckCircle2 className="w-24 h-24 text-green-500 animate-pulse" />
                <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
            
            <CardTitle className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              Payment Successful! 🎉
            </CardTitle>
            
            <CardDescription className="text-lg">
              Welcome to premium learning experience
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <p className="text-sm text-muted-foreground mb-2">Your subscription plan</p>
              <p className="text-2xl font-bold capitalize text-primary">
                {plan || 'Premium'} Plan
              </p>
            </div>

            {tranId && (
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
                <p className="text-sm font-mono font-semibold break-all">{tranId}</p>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-lg font-semibold">🎓 You now have access to:</p>
              <ul className="text-left max-w-md mx-auto space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>All B1, B2, C1, C2 lessons</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Unlimited audio lessons</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Translation features</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Progress tracking</span>
                </li>
              </ul>
            </div>

            {subscriptionActive && (
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Redirecting to dashboard in <span className="font-bold text-xl">{countdown}</span> seconds...
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => router.push('/dashboard')} 
              className="w-full"
              size="lg"
            >
              Go to Dashboard →
            </Button>
            <Button 
              onClick={() => router.push('/lessons')} 
              variant="outline"
              className="w-full"
              size="lg"
            >
              Browse Lessons
            </Button>
          </CardFooter>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Need help? Contact us at support@klartext.com</p>
        </div>
      </div>
    </div>
  );
}
