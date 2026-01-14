"use client";

import { useState, Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import api from "@/lib/axios";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Sparkles, Mail, Lock, Zap, Eye, EyeOff, BookOpen, Trophy, Users } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

// Validation Schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Floating particles component
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-white/20 rounded-full"
        animate={{
          y: [0, -30, 0],
          opacity: [0.2, 0.6, 0.2],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 4 + Math.random() * 3,
          repeat: Infinity,
          repeatType: "reverse",
          delay: Math.random() * 3,
        }}
        style={{
          left: `${5 + Math.random() * 90}%`,
          top: `${5 + Math.random() * 90}%`,
        }}
      />
    ))}
  </div>
);

function LoginForm() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [, setIsWakingServer] = useState(false);
  const searchParams = useSearchParams();

  // Wake up backend server when page loads
  useEffect(() => {
    const wakeUpServer = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        await fetch(`${apiUrl}/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000) 
        });
      } catch (error) {
        // Silently fail
      }
    };
    wakeUpServer();
  }, []);

  const isNewUser = searchParams.get("new") === "true";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const handleGoogleSignIn = async () => {
    setIsWakingServer(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    toast.info('Connecting to server...', { duration: 2000 });
    setTimeout(() => {
      window.location.href = `${apiUrl}/auth/google`;
    }, 500);
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", data);
      if (res.data && res.data.success) {
        toast.success("Welcome back!");
        login(res.data.data.accessToken, true);
        if (isNewUser) {
          setTimeout(() => {
            window.location.href = "/dashboard?onboarding=true";
          }, 100);
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Something went wrong. Please check your connection.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Mesh */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      {/* Gradient Overlays */}
      <div className="fixed inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      
      {/* Animated Orbs */}
      <motion.div
        className="fixed w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full blur-[100px] -top-32 -left-32"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] bg-gradient-to-r from-blue-600/30 to-cyan-600/30 rounded-full blur-[100px] -bottom-32 -right-32"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -30, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-full blur-[80px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      <FloatingParticles />

      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src="/logo/logo final 1.png"
              alt="KlarText Logo"
              width={300}
              height={120}
              className="h-20 w-auto mb-8"
              priority
            />
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Master German with
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Comprehensible Input
              </span>
            </h1>
            <p className="text-xl text-white/70 mb-10">
              Join thousands of learners on their journey to German fluency through engaging stories and interactive lessons.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: Users, label: "Active Learners", value: "10K+" },
                { icon: BookOpen, label: "Lessons", value: "500+" },
                { icon: Trophy, label: "Success Rate", value: "95%" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-white/50">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        {/* Back Button */}
        <Link 
          href="/" 
          className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 group z-20 text-white text-sm"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Card */}
          <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
            
            {/* Header */}
            <div className="relative p-6 sm:p-8 text-center">
              {/* Mobile Logo */}
              <div className="lg:hidden mb-4">
                <Image
                  src="/logo/logo final 1.png"
                  alt="KlarText Logo"
                  width={180}
                  height={72}
                  className="h-14 sm:h-16 w-auto mx-auto"
                  priority
                />
              </div>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/30"
              >
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Welcome Back!
              </h1>
              <p className="text-white/60 text-sm sm:text-base">
                {isNewUser ? "🎉 Account created! Please sign in." : "Sign in to continue your learning journey"}
              </p>
            </div>

            {/* Form */}
            <div className="relative px-6 sm:px-8 pb-6 sm:pb-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                {/* Email Field */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Label htmlFor="email" className="text-white/80 font-medium flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center">
                      <Mail className="w-3 h-3 text-purple-400" />
                    </div>
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      disabled={isLoading}
                      {...register("email")}
                      className="h-12 sm:h-14 bg-white/5 backdrop-blur-sm border-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 text-white placeholder:text-white/30 pl-4 rounded-xl transition-all duration-300 text-base"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  {errors.email && <p className="text-xs text-red-400 ml-1">{errors.email.message}</p>}
                </motion.div>

                {/* Password Field */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-white/80 font-medium flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center">
                        <Lock className="w-3 h-3 text-blue-400" />
                      </div>
                      Password
                    </Label>
                    <Link href="#" className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      disabled={isLoading}
                      {...register("password")}
                      className="h-12 sm:h-14 bg-white/5 backdrop-blur-sm border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 text-white placeholder:text-white/30 pl-4 pr-12 rounded-xl transition-all duration-300 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  {errors.password && <p className="text-xs text-red-400 ml-1">{errors.password.message}</p>}
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="pt-2"
                >
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-12 sm:h-14 font-semibold text-base rounded-xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_100%] animate-gradient" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative flex items-center justify-center gap-2 text-white">
                      {isLoading ? (
                        <Loader2 className="animate-spin h-5 w-5" />
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          Sign In
                        </>
                      )}
                    </span>
                  </button>
                </motion.div>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-transparent px-4 text-sm text-white/40">or</span>
                </div>
              </div>

              {/* Google Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-12 sm:h-14 font-medium text-base bg-white hover:bg-white/90 text-gray-800 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg disabled:opacity-50"
              >
                <FaGoogle className="h-5 w-5 text-red-500" />
                Continue with Google
              </motion.button>

              {/* Register Link */}
              <p className="text-center text-sm text-white/50 mt-6">
                New to KlarText?{" "}
                <Link href="/register" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom decoration */}
          <div className="mt-8 text-center text-white/30 text-xs">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
