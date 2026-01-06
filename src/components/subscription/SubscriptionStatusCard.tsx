'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Calendar, CheckCircle2, Sparkles } from 'lucide-react';

interface SubscriptionStatus {
  subscriptionStatus: 'free' | 'premium';
  subscriptionPlan: 'monthly' | 'yearly' | 'lifetime' | null;
  isPremium: boolean;
  isExpired: boolean;
  subscriptionExpiry: string | null;
  subscriptionPrice: number | null;
  accessLevels: string[];
}

export default function SubscriptionStatusCard() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view subscription status');
        setLoading(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${apiUrl}/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSubscription(data.data);
      } else {
        setError(data.message || 'Failed to fetch subscription status');
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      setError('Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) return null;

  const daysRemaining = getDaysRemaining(subscription.subscriptionExpiry);

  return (
    <Card className={`${subscription.isPremium ? 'border-primary bg-gradient-to-br from-primary/5 to-purple-500/5' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            {subscription.isPremium ? (
              <>
                <Crown className="w-6 h-6 text-yellow-500" />
                Premium Subscription
              </>
            ) : (
              <>
                🆓 Free Account
              </>
            )}
          </CardTitle>
          
          <Badge 
            variant={subscription.isPremium ? 'default' : 'secondary'}
            className={subscription.isPremium ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
          >
            {subscription.isPremium ? 'Active' : 'Free Tier'}
          </Badge>
        </div>
        
        {subscription.isPremium && subscription.subscriptionPlan && (
          <CardDescription className="text-base capitalize">
            {subscription.subscriptionPlan} Plan
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Premium Info */}
        {subscription.isPremium && (
          <>
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
              <div className="flex-1">
                {subscription.subscriptionPlan === 'lifetime' ? (
                  <div>
                    <p className="text-sm text-muted-foreground">Expiry Date</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      Never Expires - Lifetime Access
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground">Expires On</p>
                    <p className="font-semibold">{formatDate(subscription.subscriptionExpiry)}</p>
                    {daysRemaining !== null && (
                      <p className={`text-sm mt-1 ${daysRemaining < 7 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                        {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {subscription.subscriptionPrice && (
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-muted-foreground">Plan Price</p>
                <p className="font-semibold text-lg">৳{subscription.subscriptionPrice}</p>
              </div>
            )}
          </>
        )}

        {/* Access Levels */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Your Access Levels
          </h4>
          <div className="flex flex-wrap gap-2">
            {subscription.accessLevels.map((level) => (
              <Badge 
                key={level} 
                variant="secondary"
                className="font-semibold"
              >
                {level}
              </Badge>
            ))}
          </div>
        </div>

        {/* Status Message */}
        {subscription.isPremium ? (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-800 dark:text-green-300 font-medium">
              ✨ You have full access to all premium content!
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
              📚 Currently learning with free A1 and A2 lessons
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        {!subscription.isPremium ? (
          <Button 
            onClick={() => router.push('/pricing')} 
            className="w-full"
            size="lg"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        ) : subscription.isExpired ? (
          <Button 
            onClick={() => router.push('/pricing')} 
            className="w-full"
            variant="outline"
            size="lg"
          >
            Renew Subscription
          </Button>
        ) : subscription.subscriptionPlan !== 'lifetime' && daysRemaining && daysRemaining < 7 ? (
          <Button 
            onClick={() => router.push('/pricing')} 
            className="w-full"
            variant="outline"
            size="lg"
          >
            Renew Early & Save
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
