'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';

interface Plan {
  name: string;
  displayName: string;
  price: number;
  durationDays: number | null;
  discount?: string;
  features: string[];
}

interface PricingData {
  plans: Plan[];
  currency: string;
  freeLevels: string[];
  premiumLevels: string[];
}

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://klartext-backend.onrender.com/api/v1';
      const response = await fetch(`${apiUrl}/subscription/plans`);
      const data = await response.json();
      
      if (data.success) {
        setPricingData(data.data);
      } else {
        setError('Failed to load pricing plans');
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setError('Failed to load pricing plans. Please try again.');
    }
  };

  const handleUpgrade = async (planName: string) => {
    setLoading(true);
    setSelectedPlan(planName);
    setError(null);

    try {
      if (!isAuthenticated) {
        router.push('/login?redirect=/pricing');
        return;
      }
      
      const token = localStorage.getItem('accessToken');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://klartext-backend.onrender.com/api/v1';
      const response = await fetch(`${apiUrl}/payment/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          plan: planName,
          shipping_method: 'NO' // Digital product, no physical shipping
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store transaction ID for reference
        localStorage.setItem('pendingTransaction', data.data.transactionId);
        
        // Redirect to SSLCommerz payment gateway
        window.location.href = data.data.gatewayUrl;
      } else {
        setError(data.message || 'Payment initialization failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'monthly':
        return <Zap className="w-6 h-6" />;
      case 'yearly':
        return <Sparkles className="w-6 h-6" />;
      case 'lifetime':
        return <Crown className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'monthly':
        return 'from-blue-500 to-cyan-500';
      case 'yearly':
        return 'from-purple-500 to-pink-500';
      case 'lifetime':
        return 'from-amber-500 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (!pricingData) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="flex justify-center items-center min-h-[300px] sm:min-h-[400px]">
          <div className="animate-pulse text-center">
            <div className="text-lg sm:text-xl font-semibold mb-2">Loading pricing plans...</div>
            <div className="text-muted-foreground text-sm sm:text-base">Please wait</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="flex justify-center mb-4 sm:mb-6 animate-in fade-in zoom-in-95 duration-500">
          <Image
            src="/logo/logo final 1.png"
            alt="KlarText Logo"
            width={220}
            height={88}
            className="h-20 sm:h-24 md:h-28 w-auto object-contain"
            priority
          />
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-2">
          Choose Your <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Learning Plan</span>
        </h1>
        <p className="text-base sm:text-xl text-muted-foreground mb-1 sm:mb-2">
          Start with free {pricingData.freeLevels.join(', ')} lessons
        </p>
        <p className="text-sm sm:text-lg text-muted-foreground">
          Upgrade to unlock all {pricingData.premiumLevels.join(', ')} premium content
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-md mx-auto mb-6 sm:mb-8 p-3 sm:p-4 bg-destructive/10 border border-destructive rounded-lg text-center">
          <p className="text-destructive font-medium text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
        {pricingData.plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`relative overflow-hidden hover:shadow-2xl transition-all duration-300 ${
              plan.name === 'yearly' ? 'border-primary border-2 md:scale-105' : ''
            }`}
          >
            {/* Popular Badge */}
            {plan.name === 'yearly' && (
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                <Badge className="bg-primary text-primary-foreground text-xs sm:text-sm">Most Popular</Badge>
              </div>
            )}

            <CardHeader className="pb-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r ${getPlanColor(plan.name)} flex items-center justify-center text-white mb-3 sm:mb-4`}>
                {getPlanIcon(plan.name)}
              </div>
              
              <CardTitle className="text-xl sm:text-2xl">{plan.displayName}</CardTitle>
              
              {plan.discount && (
                <Badge variant="secondary" className="w-fit mt-2 text-xs">
                  {plan.discount}
                </Badge>
              )}
              
              <CardDescription className="mt-3 sm:mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs sm:text-sm">{pricingData.currency}</span>
                  <span className="text-3xl sm:text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.durationDays && (
                    <span className="text-muted-foreground text-sm">/{plan.durationDays} days</span>
                  )}
                  {!plan.durationDays && (
                    <span className="text-muted-foreground text-sm">/Lifetime</span>
                  )}
                </div>
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-4">
              <ul className="space-y-2 sm:space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 sm:gap-3">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                onClick={() => handleUpgrade(plan.name)}
                disabled={loading}
                className={`w-full ${loading && selectedPlan === plan.name ? 'opacity-50' : ''}`}
                size="lg"
              >
                {loading && selectedPlan === plan.name ? (
                  <span className="flex items-center gap-2 text-sm">
                    <span className="animate-spin">⏳</span>
                    Processing...
                  </span>
                ) : (
                  'Upgrade Now'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Free Tier Info */}
      <div className="mt-10 sm:mt-16 text-center">
        <Card className="max-w-2xl mx-auto bg-muted/50">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">🎉 Free Access Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm sm:text-base">
              Start learning German today with our free {pricingData.freeLevels.join(' and ')} lessons. 
              No credit card required. Upgrade anytime to access advanced content.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Test Cards Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 max-w-2xl mx-auto">
          <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
            <CardHeader>
              <CardTitle className="text-lg text-yellow-800 dark:text-yellow-200">
                🧪 Testing Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-yellow-700 dark:text-yellow-300">
              <p className="font-semibold mb-2">Use these test cards (no real money):</p>
              <ul className="space-y-1">
                <li>• Visa: 4111 1111 1111 1111</li>
                <li>• Mastercard: 5555 5555 5555 4444</li>
                <li>• Expiry: 12/26, CVV: 123</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
