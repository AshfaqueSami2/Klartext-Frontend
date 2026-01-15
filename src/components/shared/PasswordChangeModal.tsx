"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  Shield, 
  CheckCircle,
  KeyRound
} from "lucide-react";

// Schema for changing password (existing users)
const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Schema for setting password (Google users)
const setPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
type SetPasswordFormValues = z.infer<typeof setPasswordSchema>;

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGoogleUser?: boolean;
  onSuccess?: () => void;
}

export default function PasswordChangeModal({ 
  isOpen, 
  onClose, 
  isGoogleUser = false,
  onSuccess 
}: PasswordChangeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const changePasswordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const setPasswordForm = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
  });

  const handleSubmit = async (data: ChangePasswordFormValues | SetPasswordFormValues) => {
    setIsLoading(true);
    try {
      const endpoint = isGoogleUser ? "/auth/set-password" : "/auth/change-password";
      const response = await api.post(endpoint, data);
      
      if (response.data.success) {
        setIsSuccess(true);
        toast.success(response.data.message || "Password updated successfully!");
        
        // Reset form
        if (isGoogleUser) {
          setPasswordForm.reset();
        } else {
          changePasswordForm.reset();
        }
        
        // Call success callback after a short delay
        setTimeout(() => {
          setIsSuccess(false);
          onSuccess?.();
          onClose();
        }, 1500);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update password";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      if (isGoogleUser) {
        setPasswordForm.reset();
      } else {
        changePasswordForm.reset();
      }
      setIsSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              {isGoogleUser ? (
                <KeyRound className="h-5 w-5 text-primary" />
              ) : (
                <Shield className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle>
                {isGoogleUser ? "Set Your Password" : "Change Password"}
              </DialogTitle>
              <DialogDescription>
                {isGoogleUser 
                  ? "Create a password to login with email" 
                  : "Update your account password"
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-lg font-medium text-foreground">Password Updated!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your password has been {isGoogleUser ? "set" : "changed"} successfully.
              </p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onSubmit={isGoogleUser 
                ? setPasswordForm.handleSubmit(handleSubmit)
                : changePasswordForm.handleSubmit(handleSubmit)
              }
              className="space-y-4"
            >
              {/* Current Password - Only for non-Google users */}
              {!isGoogleUser && (
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      {...(changePasswordForm.register as any)("currentPassword")}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {changePasswordForm.formState.errors.currentPassword && (
                    <p className="text-xs text-red-500">
                      {changePasswordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>
              )}

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    {...(isGoogleUser 
                      ? setPasswordForm.register("newPassword")
                      : changePasswordForm.register("newPassword")
                    )}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {(isGoogleUser 
                  ? setPasswordForm.formState.errors.newPassword 
                  : changePasswordForm.formState.errors.newPassword
                ) && (
                  <p className="text-xs text-red-500">
                    {isGoogleUser 
                      ? setPasswordForm.formState.errors.newPassword?.message 
                      : changePasswordForm.formState.errors.newPassword?.message
                    }
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    {...(isGoogleUser 
                      ? setPasswordForm.register("confirmPassword")
                      : changePasswordForm.register("confirmPassword")
                    )}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {(isGoogleUser 
                  ? setPasswordForm.formState.errors.confirmPassword 
                  : changePasswordForm.formState.errors.confirmPassword
                ) && (
                  <p className="text-xs text-red-500">
                    {isGoogleUser 
                      ? setPasswordForm.formState.errors.confirmPassword?.message 
                      : changePasswordForm.formState.errors.confirmPassword?.message
                    }
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters long.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      {isGoogleUser ? "Set Password" : "Change Password"}
                    </>
                  )}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
