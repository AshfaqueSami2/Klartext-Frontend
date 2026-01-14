"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LiquidButton } from "@/components/ui/liquid-button";
import { Users, BookOpen, Plus, BarChart3, TrendingUp, Sparkles, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BackgroundTexture } from "@/components/ui/background-texture";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/analytics/admin-stats");
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error("Failed to load admin stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <AdminSkeleton />;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Futuristic Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-pink-500/5 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),rgba(255,255,255,0))] pointer-events-none" />
      
      <AdminNavbar />
      <BackgroundTexture />
      
      <div className="relative z-10 space-y-6 sm:space-y-8 animate-in fade-in p-3 sm:p-4 md:p-6 pt-16 sm:pt-6 max-w-7xl mx-auto">
        {/* Header with Gradient Text */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-400" />
            Admin Overview
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Manage your platform content and users with style.</p>
        </div>
        <Link href="/admin/createlesson">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <LiquidButton variant="primary" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/30 text-sm sm:text-base touch-target">
              <Plus className="mr-1.5 sm:mr-2 h-4 w-4" /> Create Lesson
            </LiquidButton>
          </motion.div>
        </Link>
        </motion.div>

      {/* Stats Cards with Glassmorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="group relative overflow-hidden border-white/10 bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Students</CardTitle>
              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {stats?.totalStudents || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                Active learners
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="group relative overflow-hidden border-white/10 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Regular Lessons</CardTitle>
              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {stats?.totalLessons || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.publishedLessons || 0} Published
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="group relative overflow-hidden border-white/10 bg-gradient-to-br from-orange-500/10 to-pink-500/10 backdrop-blur-xl hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Engagement</CardTitle>
              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg shadow-orange-500/30">
                <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-1.5 sm:gap-2">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                Active
              </div>
              <p className="text-xs text-muted-foreground mt-1">System healthy</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions with Futuristic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/admin/lessons">
            <Card className="group relative overflow-hidden border-white/10 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 backdrop-blur-xl hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-[-100%] group-hover:translate-x-[100%]" 
                   style={{ transition: 'transform 0.6s ease-in-out' }} />
              
              <CardContent className="relative p-4 sm:p-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      Regular Lessons
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Manage standard lessons</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/admin/createlesson">
            <Card className="group relative overflow-hidden border-white/10 bg-gradient-to-br from-orange-500/5 to-pink-500/5 backdrop-blur-xl hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-[-100%] group-hover:translate-x-[100%]" 
                   style={{ transition: 'transform 0.6s ease-in-out' }} />
              
              <CardContent className="relative p-4 sm:p-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg sm:rounded-xl shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                      Quick Create
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Fast lesson creation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
      </div>
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 p-3 sm:p-4 pt-16 sm:pt-4">
      <Skeleton className="h-10 sm:h-12 w-36 sm:w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <Skeleton className="h-28 sm:h-32" />
        <Skeleton className="h-28 sm:h-32" />
        <Skeleton className="h-28 sm:h-32" />
      </div>
    </div>
  );
}