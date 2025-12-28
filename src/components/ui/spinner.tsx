"use client";

import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-2",
  xl: "h-12 w-12 border-4",
};

export function Spinner({ size = "lg", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-b-primary border-t-transparent border-l-transparent border-r-transparent",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Full page centered spinner
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Spinner size="lg" />
    </div>
  );
}

// Inline spinner for buttons
export function ButtonSpinner() {
  return <Spinner size="sm" className="mr-2" />;
}
