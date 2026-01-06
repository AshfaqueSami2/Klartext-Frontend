"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Sparkles, Zap } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { LiquidButton } from "@/components/ui/liquid-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "../../../serverAction/registrationAuthAction/auth.actions";
// ⚠️ Make sure this path matches where you saved the server action file


// --- Validation Schema ---
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const handleGoogleSignUp = () => {
    // Redirect to backend Google OAuth route
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    
    // 1. Call Server Action
    // We only send the necessary fields to the backend
    const result = await registerAction({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    setIsLoading(false);

    // 2. Handle Response
    if (result.success) {
      toast.success("Account created successfully!");
      // Redirect to Login so they can get their token
      router.push("/login");
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans relative overflow-hidden">
      {/* Futuristic Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
      
      {/* Animated Orbs */}
      <motion.div
        className="fixed w-96 h-96 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-3xl opacity-20 -top-48 -right-48"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="fixed w-80 h-80 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full blur-3xl opacity-20 -bottom-40 -left-40"
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
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 opacity-50" />
          
          {/* Header with Animated Logo */}
          <div className="relative p-8 text-center">
            <motion.div 
              className="mx-auto w-20 h-20 flex items-center justify-center rounded-2xl mb-4 overflow-hidden relative bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500 shadow-lg"
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(16, 185, 129, 0.4)",
                  "0 0 30px rgba(20, 184, 166, 0.6)",
                  "0 0 20px rgba(16, 185, 129, 0.4)",
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
            <h2 className="text-4xl font-serif font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              Join KlarText
            </h2>
            <p className="text-muted-foreground text-sm">
              Start your journey to German fluency today.
            </p>
          </div>

          {/* Form Body */}
          <div className="relative p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Name Input */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Label htmlFor="name" className="text-card-foreground font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  Full Name
                </Label>
                <div className="relative group">
                  <Input
                    id="name"
                    placeholder="Hans Müller"
                    disabled={isLoading}
                    {...register("name")}
                    className="h-12 bg-white/5 backdrop-blur-sm border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 text-foreground pl-4 rounded-xl transition-all duration-300 group-hover:bg-white/10"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
                {errors.name && <p className="text-xs text-red-400 ml-1">{errors.name.message}</p>}
              </motion.div>

              {/* Email Input */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="email" className="text-card-foreground font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-teal-400" />
                  Email Address
                </Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    disabled={isLoading}
                    {...register("email")}
                    className="h-12 bg-white/5 backdrop-blur-sm border-white/10 focus:border-teal-500/50 focus:ring-teal-500/20 text-foreground pl-4 rounded-xl transition-all duration-300 group-hover:bg-white/10"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
                {errors.email && <p className="text-xs text-red-400 ml-1">{errors.email.message}</p>}
              </motion.div>

              {/* Password Input */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Label htmlFor="password" className="text-card-foreground font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  Password
                </Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    disabled={isLoading}
                    {...register("password")}
                    className="h-12 bg-white/5 backdrop-blur-sm border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-foreground pl-4 pr-12 rounded-xl transition-all duration-300 group-hover:bg-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
                {errors.password && <p className="text-xs text-red-400 ml-1">{errors.password.message}</p>}
              </motion.div>

              {/* Confirm Password Input */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Label htmlFor="confirmPassword" className="text-card-foreground font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-400" />
                  Confirm Password
                </Label>
                <div className="relative group">
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    {...register("confirmPassword")}
                    className="h-12 bg-white/5 backdrop-blur-sm border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 text-foreground pl-4 rounded-xl transition-all duration-300 group-hover:bg-white/10"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-400 ml-1">{errors.confirmPassword.message}</p>}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-2"
              >
                <LiquidButton 
                  type="submit" 
                  variant="primary"
                  className="w-full h-12 font-semibold text-base shadow-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 border-0 rounded-xl relative overflow-hidden group"
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
                        Create Account
                        <ArrowRight className="w-4 h-4" />
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

            {/* Google Sign Up Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <LiquidButton
                type="button"
                variant="outline"
                className="w-full h-12 font-medium text-base mb-6 bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/10 hover:border-white/30 rounded-xl transition-all duration-300"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
              >
                <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
                Continue with Google
              </LiquidButton>
            </motion.div>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent hover:from-emerald-300 hover:to-teal-300 transition-all">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}