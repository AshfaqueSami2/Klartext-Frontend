"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the token from URL parameters (sent by backend after successful OAuth)
        const token = searchParams.get("token");
        const error = searchParams.get("error");
        const message = searchParams.get("message");

        if (error) {
          toast.error(decodeURIComponent(error));
          router.push("/login");
          return;
        }

        if (token) {
          // Decode the token to check user role and redirect appropriately
          login(token, true); // Skip the default toast
          
          if (message) {
            toast.success(decodeURIComponent(message));
          }
        } else {
          toast.error("Authentication failed. No token received.");
          router.push("/login");
        }
      } catch (error) {
        console.error("Callback error:", error);
        toast.error("Authentication failed. Please try again.");
        router.push("/login");
      }
    };

    handleCallback();
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Completing your sign-in...
        </h2>
        <p className="text-muted-foreground">
          Please wait while we redirect you to your dashboard.
        </p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}