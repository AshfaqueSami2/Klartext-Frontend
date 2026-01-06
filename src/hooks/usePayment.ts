// Custom React hooks for payment and subscription functionality

import { useState, useEffect } from 'react';
import { paymentService, SubscriptionStatus, SubscriptionPlan, Lesson } from '@/services/payment.service';

/**
 * Hook to fetch and manage subscription status
 */
export function useSubscriptionStatus() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getSubscriptionStatus();
      setSubscription(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return {
    subscription,
    loading,
    error,
    refetch: fetchStatus,
  };
}

/**
 * Hook to fetch and manage subscription plans
 */
export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currency, setCurrency] = useState<string>('BDT');
  const [freeLevels, setFreeLevels] = useState<string[]>([]);
  const [premiumLevels, setPremiumLevels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getSubscriptionPlans();
      setPlans(data.plans);
      setCurrency(data.currency);
      setFreeLevels(data.freeLevels);
      setPremiumLevels(data.premiumLevels);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    currency,
    freeLevels,
    premiumLevels,
    loading,
    error,
    refetch: fetchPlans,
  };
}

/**
 * Hook to manage payment initialization
 */
export function usePaymentInit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializePayment = async (planName: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await paymentService.initializePayment(planName);
      
      // Redirect to payment gateway
      paymentService.redirectToPaymentGateway(data.gatewayUrl, data.transactionId);
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    initializePayment,
    loading,
    error,
  };
}

/**
 * Hook to fetch available lessons based on subscription
 */
export function useAvailableLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [stats, setStats] = useState({
    totalAvailable: 0,
    completed: 0,
    freeLessons: 0,
    premiumLessons: 0,
    lockedLessons: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getAvailableLessons();
      setLessons(data.availableLessons);
      setStats({
        totalAvailable: data.totalAvailable,
        completed: data.completed,
        freeLessons: data.freeLessons,
        premiumLessons: data.premiumLessons,
        lockedLessons: data.lockedLessons,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lessons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  return {
    lessons,
    stats,
    loading,
    error,
    refetch: fetchLessons,
  };
}

/**
 * Hook to check if user is premium
 */
export function useIsPremium() {
  const { subscription, loading } = useSubscriptionStatus();
  
  return {
    isPremium: subscription?.isPremium || false,
    isExpired: subscription?.isExpired || false,
    plan: subscription?.subscriptionPlan || null,
    loading,
  };
}

/**
 * Hook to check lesson access
 */
export function useLessonAccess(lessonId: string) {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        const access = await paymentService.checkLessonAccess(lessonId);
        setHasAccess(access);
      } catch (err) {
        console.error('Error checking lesson access:', err);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      checkAccess();
    }
  }, [lessonId]);

  return { hasAccess, loading };
}

/**
 * Hook to manage subscription expiry warnings
 */
export function useSubscriptionExpiry() {
  const { subscription } = useSubscriptionStatus();
  
  const daysRemaining = subscription?.subscriptionExpiry 
    ? paymentService.calculateDaysRemaining(subscription.subscriptionExpiry)
    : null;
  
  const isExpiringSoon = subscription?.subscriptionExpiry
    ? paymentService.isExpiringSoon(subscription.subscriptionExpiry)
    : false;
  
  return {
    daysRemaining,
    isExpiringSoon,
    expiryDate: subscription?.subscriptionExpiry || null,
    isLifetime: subscription?.subscriptionPlan === 'lifetime',
  };
}
