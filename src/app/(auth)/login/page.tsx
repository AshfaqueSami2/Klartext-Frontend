"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

import { LiquidButton } from "@/components/ui/liquid-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

// Validation Schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Check if user just registered
  const isNewUser = searchParams.get("new") === "true";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const handleGoogleSignIn = () => {
    // Redirect to backend Google OAuth route
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // 1. Make the POST request to your Backend
      const res = await api.post("/auth/login", data);

      // 2. Check for success
      if (res.data && res.data.success) {
        toast.success("Welcome back!");
        
        // 3. Login via Context (saves token and handles redirect)
        login(res.data.data.accessToken, true); // skipToast=true since we already showed it
        
        // 4. Extra redirect for new users with onboarding
        if (isNewUser) {
          // Small delay to ensure token is stored before redirect
          setTimeout(() => {
            window.location.href = "/dashboard?onboarding=true";
          }, 100);
        }
      }
    } catch (error: any) {
      // Robust error handling
      const message = error.response?.data?.message || "Something went wrong. Please check your connection.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ✨ 1. BACKGROUND: Warm Parchment Color
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans relative">
      {/* Background Texture Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'radial-gradient(hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>
      
      {/* Back to Home Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>
      
      {/* ✨ 2. CARD: Clean White with Soft Shadow */}
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        
        {/* Header Section */}
        <div className="p-8 text-center bg-card">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full mb-4 overflow-hidden relative">
            <Image
              src="/logo/klartext logo.png"
              alt="KlarText Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-serif font-bold text-card-foreground mb-2">KlarText</h1>
          <p className="text-muted-foreground text-sm">
            {isNewUser ? "Account created! Please sign in." : "Master German through comprehensible input."}
          </p>
        </div>

        {/* Form Section */}
        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="hans@example.com"
                disabled={isLoading}
                {...register("email")}
                className="h-11 bg-background border-border focus:border-primary focus:ring-primary/20 text-foreground"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-card-foreground font-medium">Password</Label>
                <Link href="#" className="text-xs text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                disabled={isLoading}
                {...register("password")}
                className="h-11 bg-background border-border focus:border-primary focus:ring-primary/20 text-foreground"
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* ✨ 4. BUTTON: Primary Color */}
            <LiquidButton 
              type="submit" 
              variant="primary"
              className="w-full h-11 font-medium text-base shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Sign In"}
            </LiquidButton>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <LiquidButton
            type="button"
            variant="outline"
            className="w-full h-11 font-medium text-base mb-6"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
            Continue with Google
          </LiquidButton>

          {/* Footer / Register Link */}
          <div className="text-center text-sm text-muted-foreground">
            New to KlarText?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}