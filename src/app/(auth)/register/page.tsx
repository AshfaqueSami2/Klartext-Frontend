"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
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
      
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        
        {/* Header */}
        <div className="bg-primary p-8 text-center relative overflow-hidden">
          <h2 className="text-3xl font-serif font-bold text-primary-foreground relative z-10">Join KlarText</h2>
          <p className="text-primary-foreground/80 text-sm mt-2 relative z-10">
            Start your journey to German fluency today.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-card-foreground font-medium ml-1">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Hans Müller"
                  disabled={isLoading}
                  {...register("name")}
                  className="pl-10 h-11 bg-background border-border focus:border-primary focus:ring-primary/20 text-foreground"
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 font-medium ml-1">{errors.name.message}</p>}
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground font-medium ml-1">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  disabled={isLoading}
                  {...register("email")}
                  className="pl-10 h-11 bg-background border-border focus:border-primary focus:ring-primary/20 text-foreground"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 font-medium ml-1">{errors.email.message}</p>}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-card-foreground font-medium ml-1">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...register("password")}
                  className="pl-10 pr-10 h-11 bg-background border-border focus:border-primary focus:ring-primary/20 text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 font-medium ml-1">{errors.password.message}</p>}
            </div>

             {/* Confirm Password Input */}
             <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground font-medium ml-1">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...register("confirmPassword")}
                  className="pl-10 h-11 bg-stone-50 border-stone-200 focus:border-teal-600 focus:ring-teal-600/20"
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 font-medium ml-1">{errors.confirmPassword.message}</p>}
            </div>

            <LiquidButton 
              type="submit" 
              variant="primary"
              className="w-full h-12 mt-2 font-bold text-base shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
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

          {/* Google Sign Up Button */}
          <LiquidButton
            type="button"
            variant="outline"
            className="w-full h-11 font-medium text-base mb-6"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
          >
            <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
            Continue with Google
          </LiquidButton>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}