"use client";

import { SWRConfig } from "swr";
import { ReactNode } from "react";
import api from "@/lib/axios";

// Global fetcher function for SWR
export const fetcher = async (url: string) => {
  const response = await api.get(url);
  return response.data?.data || response.data;
};

// SWR configuration options
const swrOptions = {
  fetcher,
  revalidateOnFocus: false, // Don't refetch when window gains focus
  revalidateOnReconnect: true, // Refetch when network reconnects
  dedupingInterval: 5000, // Dedupe requests within 5 seconds
  errorRetryCount: 3, // Retry failed requests 3 times
  errorRetryInterval: 5000, // Wait 5 seconds between retries
  shouldRetryOnError: (error: any) => {
    // Don't retry on 401/403/404
    if (error?.response?.status === 401) return false;
    if (error?.response?.status === 403) return false;
    if (error?.response?.status === 404) return false;
    return true;
  },
};

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return <SWRConfig value={swrOptions}>{children}</SWRConfig>;
}

export default SWRProvider;
