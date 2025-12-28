"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { jwtDecode } from "jwt-decode";

function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];
    
    const handleAuthSuccess = () => {
      try {
        const token = searchParams.get("token");
        
        if (token) {
          // Store token
          localStorage.setItem("accessToken", token);
          
          // Decode token to get role
          const decoded: any = jwtDecode(token);
          
          toast.success("Welcome to KlarText!");
          
          // Force redirect using window.location for reliability
          const redirectTimeout = setTimeout(() => {
            if (decoded.role === 'admin') {
              window.location.href = "/admin";
            } else {
              window.location.href = "/dashboard";
            }
          }, 1000);
          timeoutIds.push(redirectTimeout);
        } else {
          const loginTimeout = setTimeout(() => {
            window.location.href = "/login";
          }, 1000);
          timeoutIds.push(loginTimeout);
        }
      } catch (error) {
        console.error("Auth error:", error);
        const errorTimeout = setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
        timeoutIds.push(errorTimeout);
      }
    };

    handleAuthSuccess();
    
    // Cleanup: clear all timeouts on unmount
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Welcome to KlarText!
        </h2>
        <p className="text-muted-foreground">
          Completing your Google sign-in...
        </p>
      </div>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <AuthSuccessContent />
    </Suspense>
  );
}