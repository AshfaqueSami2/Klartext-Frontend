"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { LiquidButton } from "@/components/ui/liquid-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, Trophy, Flame, Medal, 
  Crown, Zap, Calendar, Users
} from "lucide-react";
import { toast } from "sonner";

// Types
interface LeaderboardUser {
  rank: number;
  user: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  totalActiveDays: number;
  isActiveToday: boolean;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'current' | 'allTime'>('current');
  const [currentLeaderboard, setCurrentLeaderboard] = useState<LeaderboardUser[]>([]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<LeaderboardUser[]>([]);
  const [myStreak, setMyStreak] = useState<StreakData | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [currentRes, allTimeRes, streakRes] = await Promise.all([
        api.get("/streak/leaderboard?limit=50"),
        api.get("/streak/leaderboard/all-time?limit=50"),
        api.get("/streak/my-streak"),
      ]);

      if (currentRes.data.success) {
        setCurrentLeaderboard(currentRes.data.data);
        // Find user's rank
        const userRank = currentRes.data.data.findIndex(
          (entry: LeaderboardUser) => entry.user._id === user?._id
        );
        if (userRank !== -1) {
          setMyRank(currentRes.data.data[userRank].rank);
        }
      }

      if (allTimeRes.data.success) {
        setAllTimeLeaderboard(allTimeRes.data.data);
      }

      if (streakRes.data.success) {
        setMyStreak(streakRes.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      toast.error("Failed to load leaderboard data");
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const leaderboard = activeTab === 'current' ? currentLeaderboard : allTimeLeaderboard;

  if (loading) {
    return <LeaderboardSkeleton />;
  }

  return (
    <div className="min-h-screen text-foreground">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-6 sm:py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <LiquidButton 
            variant="ghost" 
            onClick={() => router.push('/dashboard')}
            className="pl-0 text-muted-foreground hover:text-foreground hover:bg-transparent group text-sm mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
            Back to Dashboard
          </LiquidButton>

          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 p-6 sm:p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 mb-2"
                >
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-white/80 font-medium">Competition</span>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2"
                >
                  Streak Leaderboard 🏆
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/80 text-lg"
                >
                  Compete with other learners and keep your streak alive!
                </motion.p>
              </div>

              {/* User Stats Pills */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-3"
              >
                {myRank && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-2xl">
                    <Medal className="h-5 w-5 text-yellow-300" />
                    <div>
                      <p className="text-white font-bold text-lg">#{myRank}</p>
                      <p className="text-white/70 text-xs">Your Rank</p>
                    </div>
                  </div>
                )}
                <div className={`flex items-center gap-2 backdrop-blur-sm px-4 py-3 rounded-2xl ${
                  myStreak?.isActiveToday 
                    ? 'bg-white/30 ring-2 ring-white/50' 
                    : 'bg-white/20'
                }`}>
                  <motion.div
                    animate={myStreak?.isActiveToday ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  >
                    <Flame className="h-5 w-5 text-yellow-300" />
                  </motion.div>
                  <div>
                    <p className="text-white font-bold text-lg">{myStreak?.currentStreak || 0}</p>
                    <p className="text-white/70 text-xs">Your Streak</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Tab Switcher */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 mb-6"
        >
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'current'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                : 'bg-card/80 backdrop-blur-xl text-muted-foreground hover:text-foreground border border-border/50'
            }`}
          >
            <Flame className="h-4 w-4" />
            Current Streaks
          </button>
          <button
            onClick={() => setActiveTab('allTime')}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'allTime'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                : 'bg-card/80 backdrop-blur-xl text-muted-foreground hover:text-foreground border border-border/50'
            }`}
          >
            <Trophy className="h-4 w-4" />
            All-Time Best
          </button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatsCard 
            icon={<Users className="h-5 w-5" />}
            label="Participants"
            value={leaderboard.length.toString()}
            gradient="from-blue-500 to-indigo-500"
          />
          <StatsCard 
            icon={<Flame className="h-5 w-5" />}
            label="Your Streak"
            value={myStreak?.currentStreak?.toString() || "0"}
            gradient="from-orange-500 to-red-500"
          />
          <StatsCard 
            icon={<Trophy className="h-5 w-5" />}
            label="Best Streak"
            value={myStreak?.longestStreak?.toString() || "0"}
            gradient="from-yellow-500 to-amber-500"
          />
          <StatsCard 
            icon={<Calendar className="h-5 w-5" />}
            label="Total Days"
            value={myStreak?.totalActiveDays?.toString() || "0"}
            gradient="from-teal-500 to-emerald-500"
          />
        </motion.div>

        {/* Leaderboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-xl overflow-hidden">
            <CardContent className="p-0">
              {/* Top 3 Podium */}
              {leaderboard.length >= 3 && (
                <div className="p-6 pb-0">
                  <div className="flex items-end justify-center gap-4 pb-6">
                    {/* 2nd Place */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-col items-center"
                    >
                      <div className="relative mb-2">
                        <Avatar className="h-16 w-16 ring-4 ring-gray-400">
                          <AvatarImage src={leaderboard[1]?.user.profileImage} />
                          <AvatarFallback className="bg-gray-400 text-white text-xl">
                            {leaderboard[1]?.user.name?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
                          2
                        </div>
                      </div>
                      <p className="font-medium text-sm text-foreground truncate max-w-[80px]">
                        {leaderboard[1]?.user._id === user?._id ? 'You' : leaderboard[1]?.user.name}
                      </p>
                      <div className="flex items-center gap-1 text-orange-500">
                        <Flame className="h-3 w-3" />
                        <span className="font-bold text-sm">{leaderboard[1]?.currentStreak}</span>
                      </div>
                      <div className="w-16 h-20 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-lg mt-2" />
                    </motion.div>

                    {/* 1st Place */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                      className="flex flex-col items-center"
                    >
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <Crown className="h-8 w-8 text-yellow-500 mb-1" />
                      </motion.div>
                      <div className="relative mb-2">
                        <Avatar className="h-20 w-20 ring-4 ring-yellow-500">
                          <AvatarImage src={leaderboard[0]?.user.profileImage} />
                          <AvatarFallback className="bg-yellow-500 text-white text-2xl">
                            {leaderboard[0]?.user.name?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center text-white text-sm font-bold">
                          1
                        </div>
                      </div>
                      <p className="font-bold text-foreground truncate max-w-[100px]">
                        {leaderboard[0]?.user._id === user?._id ? 'You' : leaderboard[0]?.user.name}
                      </p>
                      <div className="flex items-center gap-1 text-orange-500">
                        <Flame className="h-4 w-4" />
                        <span className="font-bold">{leaderboard[0]?.currentStreak}</span>
                      </div>
                      <div className="w-20 h-28 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg mt-2" />
                    </motion.div>

                    {/* 3rd Place */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.55 }}
                      className="flex flex-col items-center"
                    >
                      <div className="relative mb-2">
                        <Avatar className="h-14 w-14 ring-4 ring-orange-600">
                          <AvatarImage src={leaderboard[2]?.user.profileImage} />
                          <AvatarFallback className="bg-orange-600 text-white text-lg">
                            {leaderboard[2]?.user.name?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-bold">
                          3
                        </div>
                      </div>
                      <p className="font-medium text-sm text-foreground truncate max-w-[80px]">
                        {leaderboard[2]?.user._id === user?._id ? 'You' : leaderboard[2]?.user.name}
                      </p>
                      <div className="flex items-center gap-1 text-orange-500">
                        <Flame className="h-3 w-3" />
                        <span className="font-bold text-sm">{leaderboard[2]?.currentStreak}</span>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-t from-orange-600 to-orange-500 rounded-t-lg mt-2" />
                    </motion.div>
                  </div>
                </div>
              )}

              {/* Full List */}
              <div className="border-t border-border/50">
                <div className="p-4 bg-muted/30">
                  <div className="grid grid-cols-12 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-5 sm:col-span-4">User</div>
                    <div className="col-span-3 sm:col-span-3 text-center">Streak</div>
                    <div className="col-span-3 sm:col-span-2 text-center hidden sm:block">Best</div>
                    <div className="col-span-3 sm:col-span-2 text-center">Days</div>
                  </div>
                </div>
                
                <div className="divide-y divide-border/30 max-h-[400px] overflow-y-auto">
                  <AnimatePresence>
                    {leaderboard.map((entry, index) => {
                      const isCurrentUser = entry.user._id === user?._id;
                      
                      return (
                        <motion.div
                          key={entry.user._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className={`grid grid-cols-12 items-center p-4 transition-all ${
                            isCurrentUser 
                              ? 'bg-primary/10 hover:bg-primary/15' 
                              : 'hover:bg-muted/30'
                          }`}
                        >
                          {/* Rank */}
                          <div className="col-span-1 text-center">
                            {entry.rank <= 3 ? (
                              <span className="text-lg">
                                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                              </span>
                            ) : (
                              <span className="font-bold text-muted-foreground">{entry.rank}</span>
                            )}
                          </div>

                          {/* User */}
                          <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={entry.user.profileImage} />
                              <AvatarFallback className={`text-sm ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                {entry.user.name?.charAt(0)?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className={`font-medium truncate ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                                {isCurrentUser ? 'You' : entry.user.name}
                              </p>
                            </div>
                          </div>

                          {/* Current Streak */}
                          <div className="col-span-3 sm:col-span-3 flex items-center justify-center">
                            <div className="flex items-center gap-1 bg-orange-500/10 px-3 py-1.5 rounded-full">
                              <Flame className="h-4 w-4 text-orange-500" />
                              <span className="font-bold text-orange-600 dark:text-orange-400">
                                {entry.currentStreak}
                              </span>
                            </div>
                          </div>

                          {/* Best Streak */}
                          <div className="col-span-3 sm:col-span-2 text-center hidden sm:flex items-center justify-center">
                            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500">
                              <Trophy className="h-3 w-3" />
                              <span className="font-medium">{entry.longestStreak}</span>
                            </div>
                          </div>

                          {/* Total Days */}
                          <div className="col-span-3 sm:col-span-2 text-center">
                            <span className="text-muted-foreground">{entry.totalActiveDays}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {leaderboard.length === 0 && (
                <div className="text-center py-16">
                  <Trophy className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">No Streaks Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to start a learning streak!
                  </p>
                  <LiquidButton onClick={() => router.push('/lessons')} className="gap-2">
                    <Zap className="h-4 w-4" />
                    Start Learning
                  </LiquidButton>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Motivation Section */}
        {myStreak && !myStreak.isActiveToday && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-xl">
              <CardContent className="p-6 text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="inline-block mb-3"
                >
                  <Flame className="h-10 w-10 text-orange-500" />
                </motion.div>
                <h3 className="text-lg font-bold text-foreground mb-2">Keep Your Streak Alive! 🔥</h3>
                <p className="text-muted-foreground mb-4">
                  Complete a lesson today to maintain your {myStreak.currentStreak}-day streak!
                </p>
                <LiquidButton onClick={() => router.push('/lessons')} className="gap-2">
                  <Zap className="h-4 w-4" />
                  Start a Lesson
                </LiquidButton>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ 
  icon, 
  label, 
  value, 
  gradient 
}: { 
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
}) {
  return (
    <div className="group relative overflow-hidden bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      <div className="relative z-10 flex items-center gap-3">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton
function LeaderboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-48 w-full rounded-3xl" />
      <div className="flex gap-2">
        <Skeleton className="h-12 w-40 rounded-xl" />
        <Skeleton className="h-12 w-40 rounded-xl" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
