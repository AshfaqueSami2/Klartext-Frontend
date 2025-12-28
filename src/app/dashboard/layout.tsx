"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/shared/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push("/login");
      } else if (user.role === 'admin') {
        // Admin user, redirect to admin dashboard
        router.push("/admin");
      }
    }
  }, [user, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only render student content if user is student
  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Background Texture Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0" 
           style={{ backgroundImage: 'radial-gradient(hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>
      <Sidebar />
      
      <div className="flex-1 md:pl-64 transition-all duration-300">
        <main className="p-8 max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}