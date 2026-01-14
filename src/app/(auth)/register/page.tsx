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
import { Loader2, User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Sparkles, Zap, CheckCircle, BookOpen, Award, Headphones } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "../../../serverAction/registrationAuthAction/auth.actions";

// Validation Schema
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

// Features list
const features = [
  { icon: BookOpen, text: "500+ Interactive Lessons" },
  { icon: Headphones, text: "Native Audio Pronunciation" },
  { icon: Award, text: "Track Your Progress" },
  { icon: CheckCircle, text: "Personalized Learning Path" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const handleGoogleSignUp = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://klartext-backend.onrender.com/api/v1';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    
    const result = await registerAction({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    setIsLoading(false);

    if (result.success) {
      toast.success("Account created successfully!");
      router.push("/login?new=true");
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex font-sans relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      {/* Animated Background Mesh */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      {/* Gradient Overlays */}
      <div className="fixed inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      
      {/* Animated Orbs */}
      <motion.div
        className="fixed w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-gradient-to-r from-emerald-600/30 to-teal-600/30 rounded-full blur-[100px] -top-32 -right-32"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] bg-gradient-to-r from-cyan-600/30 to-blue-600/30 rounded-full blur-[100px] -bottom-32 -left-32"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, 30, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-full blur-[80px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
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
              Start Your German
              <span className="block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Learning Journey
              </span>
            </h1>
            <p className="text-xl text-white/70 mb-10">
              Create your free account and unlock access to hundreds of engaging German lessons designed for all levels.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-white/80 text-lg">{feature.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 py-8">
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
          className="w-full max-w-md relative z-10 mt-8 sm:mt-0"
        >
          {/* Card */}
          <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
            
            {/* Header */}
            <div className="relative p-5 sm:p-6 text-center">
              {/* Mobile Logo */}
              <div className="lg:hidden mb-3">
                <Image
                  src="/logo/logo final 1.png"
                  alt="KlarText Logo"
                  width={160}
                  height={64}
                  className="h-12 sm:h-14 w-auto mx-auto"
                  priority
                />
              </div>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/30"
              >
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </motion.div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                Create Account
              </h1>
              <p className="text-white/60 text-sm">
                Start your journey to German fluency
              </p>
            </div>

            {/* Form */}
            <div className="relative px-5 sm:px-6 pb-5 sm:pb-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                {/* Name Field */}
                <motion.div 
                  className="space-y-1.5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Label htmlFor="name" className="text-white/80 font-medium flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center">
                      <User className="w-3 h-3 text-emerald-400" />
                    </div>
                    Full Name
                  </Label>
                  <div className="relative group">
                    <Input
                      id="name"
                      placeholder="Hans Müller"
                      disabled={isLoading}
                      {...register("name")}
                      className="h-11 sm:h-12 bg-white/5 backdrop-blur-sm border-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-white placeholder:text-white/30 pl-4 rounded-xl transition-all duration-300 text-base"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  {errors.name && <p className="text-xs text-red-400 ml-1">{errors.name.message}</p>}
                </motion.div>

                {/* Email Field */}
                <motion.div 
                  className="space-y-1.5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Label htmlFor="email" className="text-white/80 font-medium flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded bg-teal-500/20 flex items-center justify-center">
                      <Mail className="w-3 h-3 text-teal-400" />
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
                      className="h-11 sm:h-12 bg-white/5 backdrop-blur-sm border-white/10 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 text-white placeholder:text-white/30 pl-4 rounded-xl transition-all duration-300 text-base"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500/20 to-cyan-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  {errors.email && <p className="text-xs text-red-400 ml-1">{errors.email.message}</p>}
                </motion.div>

                {/* Password Field */}
                <motion.div 
                  className="space-y-1.5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label htmlFor="password" className="text-white/80 font-medium flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded bg-cyan-500/20 flex items-center justify-center">
                      <Lock className="w-3 h-3 text-cyan-400" />
                    </div>
                    Password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      disabled={isLoading}
                      {...register("password")}
                      className="h-11 sm:h-12 bg-white/5 backdrop-blur-sm border-white/10 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder:text-white/30 pl-4 pr-12 rounded-xl transition-all duration-300 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  {errors.password && <p className="text-xs text-red-400 ml-1">{errors.password.message}</p>}
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div 
                  className="space-y-1.5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Label htmlFor="confirmPassword" className="text-white/80 font-medium flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center">
                      <Lock className="w-3 h-3 text-blue-400" />
                    </div>
                    Confirm Password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      disabled={isLoading}
                      {...register("confirmPassword")}
                      className="h-11 sm:h-12 bg-white/5 backdrop-blur-sm border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 text-white placeholder:text-white/30 pl-4 pr-12 rounded-xl transition-all duration-300 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-400 ml-1">{errors.confirmPassword.message}</p>}
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="pt-2"
                >
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-11 sm:h-12 font-semibold text-base rounded-xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-[length:200%_100%] animate-gradient" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative flex items-center justify-center gap-2 text-white">
                      {isLoading ? (
                        <Loader2 className="animate-spin h-5 w-5" />
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          Create Account
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </span>
                  </button>
                </motion.div>
              </form>

              {/* Divider */}
              <div className="relative my-5">
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
                transition={{ delay: 0.7 }}
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full h-11 sm:h-12 font-medium text-base bg-white hover:bg-white/90 text-gray-800 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg disabled:opacity-50"
              >
                <FaGoogle className="h-5 w-5 text-red-500" />
                Continue with Google
              </motion.button>

              {/* Login Link */}
              <p className="text-center text-sm text-white/50 mt-5">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom decoration */}
          <div className="mt-6 text-center text-white/30 text-xs">
            By creating an account, you agree to our Terms of Service and Privacy Policy
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
