"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import api from "@/lib/axios";

import { LiquidButton } from "@/components/ui/liquid-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Sparkles, Mail, Lock, Zap } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans relative overflow-hidden">
      {/* Futuristic Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      
      {/* Animated Orbs */}
      <motion.div
        className="fixed w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20 -top-48 -left-48"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="fixed w-80 h-80 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-3xl opacity-20 -bottom-40 -right-40"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [360, 180, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Back to Home Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group z-20"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Home</span>
      </Link>
      
      {/* Futuristic Card with Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 opacity-50" />
          
          {/* Header Section with Animated Logo */}
          <div className="relative p-8 text-center">
            <motion.div 
              className="mx-auto w-20 h-20 flex items-center justify-center rounded-2xl mb-4 overflow-hidden relative bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-500 shadow-lg"
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(168, 85, 247, 0.4)",
                  "0 0 30px rgba(59, 130, 246, 0.6)",
                  "0 0 20px rgba(168, 85, 247, 0.4)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Image
                src="/logo/main logo.png"
                alt="KlarText Logo"
                width={60}
                height={60}
                className="object-contain p-2 mix-blend-lighten"
                priority
              />
            </motion.div>
            <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-sm">
              {isNewUser ? "🎉 Account created! Please sign in." : "Master German through comprehensible input."}
            </p>
          </div>

          {/* Form Section */}
          <div className="relative px-8 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Label htmlFor="email" className="text-card-foreground font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  Email Address
                </Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder="hans@example.com"
                    disabled={isLoading}
                    {...register("email")}
                    className="h-12 bg-white/5 backdrop-blur-sm border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-foreground pl-4 rounded-xl transition-all duration-300 group-hover:bg-white/10"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
                {errors.email && <p className="text-xs text-red-400 ml-1">{errors.email.message}</p>}
              </motion.div>

              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-card-foreground font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-400" />
                    Password
                  </Label>
                  <Link href="#" className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    {...register("password")}
                    className="h-12 bg-white/5 backdrop-blur-sm border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 text-foreground pl-4 rounded-xl transition-all duration-300 group-hover:bg-white/10"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
                {errors.password && <p className="text-xs text-red-400 ml-1">{errors.password.message}</p>}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <LiquidButton 
                  type="submit" 
                  variant="primary"
                  className="w-full h-12 font-semibold text-base shadow-lg bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 border-0 rounded-xl relative overflow-hidden group"
                  disabled={isLoading}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Sign In
                      </>
                    )}
                  </span>
                </LiquidButton>
              </motion.div>
            </form>

            {/* Divider with gradient */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card/80 backdrop-blur-sm px-3 py-1 text-muted-foreground rounded-full border border-white/10">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <LiquidButton
                type="button"
                variant="outline"
                className="w-full h-12 font-medium text-base mb-6 bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/10 hover:border-white/30 rounded-xl transition-all duration-300"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
                Continue with Google
              </LiquidButton>
            </motion.div>

            {/* Footer / Register Link */}
            <div className="text-center text-sm text-muted-foreground">
              New to KlarText?{" "}
              <Link href="/register" className="font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-blue-300 transition-all">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
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