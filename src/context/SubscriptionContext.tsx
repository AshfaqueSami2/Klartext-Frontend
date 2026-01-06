"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { paymentService, SubscriptionStatus } from "@/services/payment.service";
import { useAuth } from "./AuthContext";

interface SubscriptionContextType {
  subscription: SubscriptionStatus | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    // Only fetch if user is authenticated
    if (!isAuthenticated || !user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    // Admin users automatically get premium access without subscription
    if (user.role === 'admin') {
      setSubscription({
        isPremium: true,
        subscriptionStatus: 'premium',
        subscriptionPlan: 'admin',
        subscriptionExpiry: null,
        subscriptionPrice: 0,
        daysRemaining: null,
        isExpiringSoon: false,
        isExpired: false,
        accessLevels: ['all'],
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getSubscriptionStatus();
      setSubscription(data);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [isAuthenticated, user]);

  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  return (
    <SubscriptionContext.Provider value={{ subscription, loading, error, refreshSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
