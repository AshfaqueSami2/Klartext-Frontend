/**
 * Enhanced API Client for Grammar System
 * Provides retry logic, request cancellation, and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { GRAMMAR_CONFIG } from '@/config/grammar-config';
import type { GrammarError } from '@/types/grammar-types';

// ============================================================================
// Types
// ============================================================================

interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

interface RequestOptions extends AxiosRequestConfig {
  retry?: boolean;
  retryConfig?: Partial<RetryConfig>;
}

// ============================================================================
// Error Utilities
// ============================================================================

const createGrammarError = (error: AxiosError | Error): GrammarError => {
  if (axios.isAxiosError(error)) {
    const grammarError = new Error(
      error.response?.data?.message || error.message
    ) as GrammarError;

    grammarError.code = error.code;
    grammarError.statusCode = error.response?.status;
    grammarError.retryable = isRetryableError(error);

    return grammarError;
  }

  const grammarError = new Error(error.message) as GrammarError;
  grammarError.retryable = false;
  return grammarError;
};

const isRetryableError = (error: AxiosError): boolean => {
  // Don't retry client errors (4xx except 429)
  if (error.response) {
    const status = error.response.status;
    return status === 429 || status >= 500;
  }

  // Retry network errors and timeouts
  return (
    error.code === 'ECONNABORTED' ||
    error.code === 'ETIMEDOUT' ||
    error.code === 'ENOTFOUND' ||
    error.code === 'ENETUNREACH' ||
    !error.response
  );
};

// ============================================================================
// Retry Logic
// ============================================================================

const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

const calculateBackoff = (
  attempt: number,
  config: RetryConfig
): number => {
  const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
};

async function retryRequest<T>(
  requestFn: () => Promise<T>,
  config: RetryConfig,
  signal?: AbortSignal
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      // Check if request was cancelled
      if (signal?.aborted) {
        throw new Error('Request cancelled');
      }

      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      const grammarError = createGrammarError(lastError as any);

      // Don't retry if not retryable or last attempt
      if (!grammarError.retryable || attempt === config.maxAttempts) {
        throw grammarError;
      }

      // Calculate backoff delay
      const backoffDelay = calculateBackoff(attempt, config);

      if (GRAMMAR_CONFIG.DEV.LOG_API_CALLS) {
        console.warn(
          `Request failed (attempt ${attempt}/${config.maxAttempts}). Retrying in ${backoffDelay}ms...`,
          error
        );
      }

      // Wait before retry
      await sleep(backoffDelay);
    }
  }

  throw createGrammarError(lastError!);
}

// ============================================================================
// Enhanced API Client Class
// ============================================================================

class EnhancedAPIClient {
  private client: AxiosInstance;
  private activeRequests: Map<string, AbortController>;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: GRAMMAR_CONFIG.API.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.activeRequests = new Map();
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (GRAMMAR_CONFIG.DEV.LOG_API_CALLS) {
          console.log('API Request:', config.method?.toUpperCase(), config.url);
        }
        return config;
      },
      (error) => {
        if (GRAMMAR_CONFIG.DEV.LOG_ERRORS) {
          console.error('Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        if (GRAMMAR_CONFIG.DEV.LOG_API_CALLS) {
          console.log('API Response:', response.status, response.config.url);
        }
        return response;
      },
      (error) => {
        if (GRAMMAR_CONFIG.DEV.LOG_ERRORS) {
          console.error('Response Error:', error.response?.status, error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Cancel an active request by key
   */
  cancelRequest(key: string): void {
    const controller = this.activeRequests.get(key);
    if (controller) {
      controller.abort();
      this.activeRequests.delete(key);
    }
  }

  /**
   * Cancel all active requests
   */
  cancelAllRequests(): void {
    this.activeRequests.forEach((controller) => controller.abort());
    this.activeRequests.clear();
  }

  /**
   * Make a GET request with retry and cancellation support
   */
  async get<T>(
    url: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      retry = true,
      retryConfig = GRAMMAR_CONFIG.API.RETRY,
      ...axiosConfig
    } = options;

    // Create abort controller for this request
    const requestKey = `GET:${url}`;
    this.cancelRequest(requestKey); // Cancel any existing request

    const controller = new AbortController();
    this.activeRequests.set(requestKey, controller);

    const config: AxiosRequestConfig = {
      ...axiosConfig,
      signal: controller.signal,
    };

    const requestFn = () => this.client.get<T>(url, config).then(res => res.data);

    try {
      if (retry) {
        const fullRetryConfig: RetryConfig = {
          maxAttempts: retryConfig.maxAttempts ?? GRAMMAR_CONFIG.API.RETRY.maxAttempts,
          initialDelay: retryConfig.initialDelay ?? GRAMMAR_CONFIG.API.RETRY.initialDelay,
          maxDelay: retryConfig.maxDelay ?? GRAMMAR_CONFIG.API.RETRY.maxDelay,
          backoffMultiplier: retryConfig.backoffMultiplier ?? GRAMMAR_CONFIG.API.RETRY.backoffMultiplier,
        };
        return await retryRequest(requestFn, fullRetryConfig, controller.signal);
      } else {
        return await requestFn();
      }
    } finally {
      this.activeRequests.delete(requestKey);
    }
  }

  /**
   * Make a POST request with retry support
   */
  async post<T>(
    url: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      retry = true,
      retryConfig = GRAMMAR_CONFIG.API.RETRY,
      ...axiosConfig
    } = options;

    const requestKey = `POST:${url}`;
    this.cancelRequest(requestKey);

    const controller = new AbortController();
    this.activeRequests.set(requestKey, controller);

    const config: AxiosRequestConfig = {
      ...axiosConfig,
      signal: controller.signal,
    };

    const requestFn = () => this.client.post<T>(url, data, config).then(res => res.data);

    try {
      if (retry) {
        const fullRetryConfig: RetryConfig = {
          maxAttempts: retryConfig.maxAttempts ?? GRAMMAR_CONFIG.API.RETRY.maxAttempts,
          initialDelay: retryConfig.initialDelay ?? GRAMMAR_CONFIG.API.RETRY.initialDelay,
          maxDelay: retryConfig.maxDelay ?? GRAMMAR_CONFIG.API.RETRY.maxDelay,
          backoffMultiplier: retryConfig.backoffMultiplier ?? GRAMMAR_CONFIG.API.RETRY.backoffMultiplier,
        };
        return await retryRequest(requestFn, fullRetryConfig, controller.signal);
      } else {
        return await requestFn();
      }
    } finally {
      this.activeRequests.delete(requestKey);
    }
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

// Use existing axios instance base URL or default
import axiosInstance from '@/lib/axios';
export const grammarAPIClient = new EnhancedAPIClient(
  axiosInstance.defaults.baseURL || 'http://localhost:5000/api/v1'
);
