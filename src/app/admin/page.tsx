"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LiquidButton } from "@/components/ui/liquid-button";
import { Users, BookOpen, Plus, BarChart3 } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      <BackgroundTexture />
      
      <div className="space-y-8 animate-in fade-in relative z-10 p-6">
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Admin Overview</h1>
          <p className="text-muted-foreground">Manage your platform content and users.</p>
        </div>
        <Link href="/admin/create">
          <LiquidButton variant="primary">
            <Plus className="mr-2 h-4 w-4" /> Create Lesson
          </LiquidButton>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.totalStudents || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Regular Lessons</CardTitle>
            <BookOpen className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.totalLessons || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.publishedLessons || 0} Published</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement</CardTitle>
            <BarChart3 className="h-4 w-4 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">Active</div>
            <p className="text-xs text-muted-foreground">System healthy</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/lessons">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Regular Lessons</h3>
                  <p className="text-sm text-muted-foreground">Manage standard lessons</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/createlesson">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Plus className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Quick Create</h3>
                  <p className="text-sm text-muted-foreground">Fast lesson creation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
      </div>
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className="space-y-8 p-4">
      <Skeleton className="h-12 w-48" />
      <div className="grid grid-cols-3 gap-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}