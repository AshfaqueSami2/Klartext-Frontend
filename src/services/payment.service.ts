// Payment Service - Handles all payment-related API calls

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://klartext-backend.onrender.com/api/v1';

export interface SubscriptionPlan {
  name: string;
  displayName: string;
  price: number;
  durationDays: number | null;
  discount?: string;
  features: string[];
}

export interface PricingData {
  plans: SubscriptionPlan[];
  currency: string;
  freeLevels: string[];
  premiumLevels: string[];
}

export interface PaymentInitResponse {
  gatewayUrl: string;
  sessionKey: string;
  transactionId: string;
  amount: number;
  plan: string;
}

export interface SubscriptionStatus {
  subscriptionStatus: 'free' | 'premium';
  subscriptionPlan: 'monthly' | 'yearly' | 'lifetime' | 'admin' | null;
  isPremium: boolean;
  isExpired: boolean;
  subscriptionExpiry: string | null;
  subscriptionPrice: number | null;
  accessLevels: string[];
  daysRemaining?: number | null;
  isExpiringSoon?: boolean;
}

export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  difficulty: string;
  isPremium: boolean;
  canAccess: boolean;
  requiresUpgrade: boolean;
  lockReason: string | null;
  isCompleted: boolean;
  duration?: number;
  topicCount?: number;
}

export interface AvailableLessonsResponse {
  currentLevel: string;
  subscriptionStatus: string;
  subscriptionPlan: string | null;
  isPremium: boolean;
  availableLessons: Lesson[];
  totalAvailable: number;
  completed: number;
  freeLessons: number;
  premiumLessons: number;
  lockedLessons: number;
}

class PaymentService {
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /**
   * Get all available subscription plans (public endpoint)
   */
  async getSubscriptionPlans(): Promise<PricingData> {
    try {
      const response = await fetch(`${API_URL}/subscription/plans`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch subscription plans');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  /**
   * Get user's subscription status (requires authentication)
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const response = await fetch(`${API_URL}/subscription/status`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch subscription status');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      throw error;
    }
  }

  /**
   * Initialize payment for a subscription plan
   */
  async initializePayment(planName: string): Promise<PaymentInitResponse> {
    try {
      const response = await fetch(`${API_URL}/payment/init`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ 
          plan: planName,
          shipping_method: 'NO' // Digital product, no physical shipping required
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to initialize payment');
      }

      return data.data;
    } catch (error) {
      console.error('Error initializing payment:', error);
      throw error;
    }
  }

  /**
   * Get available lessons based on user's subscription
   */
  async getAvailableLessons(): Promise<AvailableLessonsResponse> {
    try {
      const response = await fetch(`${API_URL}/progress/available-lessons`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch available lessons');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching available lessons:', error);
      throw error;
    }
  }

  /**
   * Check if user has access to a specific lesson
   */
  async checkLessonAccess(lessonId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/lessons/${lessonId}/access`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!data.success) {
        return false;
      }

      return data.data.hasAccess || false;
    } catch (error) {
      console.error('Error checking lesson access:', error);
      return false;
    }
  }

  /**
   * Redirect to payment gateway
   */
  redirectToPaymentGateway(gatewayUrl: string, transactionId: string): void {
    // Store transaction ID for later reference
    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingTransaction', transactionId);
      window.location.href = gatewayUrl;
    }
  }

  /**
   * Get pending transaction ID
   */
  getPendingTransaction(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pendingTransaction');
    }
    return null;
  }

  /**
   * Clear pending transaction
   */
  clearPendingTransaction(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pendingTransaction');
    }
  }

  /**
   * Format currency (BDT)
   */
  formatCurrency(amount: number, currency: string = 'BDT'): string {
    const symbols: Record<string, string> = {
      BDT: '৳',
      USD: '$',
      EUR: '€',
    };

    return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
  }

  /**
   * Calculate days remaining until expiry
   */
  calculateDaysRemaining(expiryDate: string | null): number | null {
    if (!expiryDate) return null;
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  /**
   * Check if subscription is expiring soon (within 7 days)
   */
  isExpiringSoon(expiryDate: string | null): boolean {
    const daysRemaining = this.calculateDaysRemaining(expiryDate);
    return daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7;
  }

  /**
   * Get plan recommendation based on user's needs
   */
  getPlanRecommendation(currentPlan: string | null): string {
    if (!currentPlan || currentPlan === 'monthly') {
      return 'yearly'; // Recommend yearly for best value
    }
    if (currentPlan === 'yearly') {
      return 'lifetime'; // Recommend lifetime for long-term commitment
    }
    return 'yearly';
  }
}

// Export singleton instance
export const paymentService = new PaymentService();

// Export class for testing or custom instances
export default PaymentService;
