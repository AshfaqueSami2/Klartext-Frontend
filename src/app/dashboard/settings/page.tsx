"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PasswordChangeModal from "@/components/shared/PasswordChangeModal";
import { 
  ArrowLeft,
  Shield,
  KeyRound,
  Mail,
  User,
  Sparkles,
  Lock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface UserSettings {
  _id: string;
  name: string;
  email: string;
  authProvider?: 'local' | 'google';
  hasPassword?: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get("/user/me");
      setSettings(response.data.data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSuccess = () => {
    toast.success("Password updated successfully!");
    // Refresh settings to update hasPassword status
    fetchSettings();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground animate-pulse">Loading settings...</p>
        </motion.div>
      </div>
    );
  }

  const isGoogleUser = settings?.authProvider === 'google';
  const hasPassword = settings?.hasPassword !== false; // Default to true for local users

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pt-16 md:pt-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="gap-2 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground text-sm">Manage your account settings and security</p>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Account Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Account Information
                </CardTitle>
                <CardDescription>Your account details and login method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{settings?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Login Method</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {isGoogleUser ? 'Google Account' : 'Email & Password'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={isGoogleUser ? "secondary" : "default"}>
                    {isGoogleUser ? 'Google' : 'Local'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Security
                </CardTitle>
                <CardDescription>Manage your password and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Password Section */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isGoogleUser && !hasPassword 
                        ? 'bg-orange-500/10' 
                        : 'bg-green-500/10'
                    }`}>
                      <KeyRound className={`h-4 w-4 ${
                        isGoogleUser && !hasPassword 
                          ? 'text-orange-500' 
                          : 'text-green-500'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">
                        {isGoogleUser 
                          ? (hasPassword 
                              ? 'Password set - You can login with email too' 
                              : 'No password set - Login via Google only')
                          : 'Password protected account'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isGoogleUser && !hasPassword ? (
                      <Badge variant="outline" className="text-orange-500 border-orange-500/30">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not Set
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-500 border-green-500/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Password Action Button */}
                <Button 
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
                >
                  <KeyRound className="h-4 w-4" />
                  {isGoogleUser 
                    ? (hasPassword ? 'Change Password' : 'Set Password')
                    : 'Change Password'
                  }
                </Button>

                {isGoogleUser && !hasPassword && (
                  <p className="text-xs text-muted-foreground">
                    Setting a password allows you to login with your email address in addition to Google.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="justify-start gap-2 h-auto py-4"
                  onClick={() => router.push("/dashboard/profile")}
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Edit Profile</p>
                    <p className="text-xs text-muted-foreground">Update your info</p>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start gap-2 h-auto py-4"
                  onClick={() => router.push("/dashboard")}
                >
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <ArrowLeft className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Dashboard</p>
                    <p className="text-xs text-muted-foreground">Back to learning</p>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Password Change Modal */}
        <PasswordChangeModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          isGoogleUser={isGoogleUser && !hasPassword}
          onSuccess={handlePasswordSuccess}
        />
      </div>
    </div>
  );
}
