"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import PasswordChangeModal from "@/components/shared/PasswordChangeModal";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the token from URL parameters (sent by backend after successful OAuth)
        const token = searchParams.get("token");
        const error = searchParams.get("error");
        const message = searchParams.get("message");
        const needsPasswordChange = searchParams.get("needsPasswordChange") === "true";

        if (error) {
          toast.error(decodeURIComponent(error));
          router.push("/login");
          return;
        }

        if (token) {
          // Store token temporarily if user needs to set password
          if (needsPasswordChange) {
            login(token, true); // Login first so API calls work
            setShowPasswordModal(true);
            toast.info("Please set a password for your account", { duration: 5000 });
          } else {
            // Decode the token to check user role and redirect appropriately
            login(token, true); // Skip the default toast
            
            if (message) {
              toast.success(decodeURIComponent(message));
            }
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

  const handlePasswordSetComplete = () => {
    setShowPasswordModal(false);
    toast.success("Password set successfully! You can now login with email too.");
    router.push("/dashboard");
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    toast.info("You can set a password later from your profile settings.");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md px-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Completing your sign-in...
        </h2>
        <p className="text-muted-foreground">
          Please wait while we connect to the server.
        </p>
        <p className="text-sm text-muted-foreground/70">
          This may take up to 30 seconds if the server is waking up.
        </p>
      </div>

      {/* Password Set Modal for Google Users */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={handlePasswordModalClose}
        isGoogleUser={true}
        onSuccess={handlePasswordSetComplete}
      />
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