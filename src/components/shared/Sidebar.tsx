"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { 
  LayoutDashboard, 
  Trophy, 
  Settings, 
  LogOut, 
  BookMarked,
  Home,
  Library,
  GraduationCap,
  Crown,
  Sparkles,
  ChevronRight,
  User,
  RefreshCw
} from "lucide-react";
import { LiquidButton } from "@/components/ui/liquid-button";
import { SimpleThemeToggle } from "@/components/theme-toggle";

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { subscription, loading, refreshSubscription } = useSubscription();

  const navigation = [
    { name: "Home", href: "/", icon: Home, badge: null },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: null },
    { name: "Library", href: "/lessons", icon: Library, badge: null },
    { name: "Grammar", href: "/grammar", icon: GraduationCap, badge: null },
    { name: "My Vocabulary", href: "/myVocabulary", icon: BookMarked, badge: null },
    { name: "Profile", href: "/dashboard/profile", icon: User, badge: null },
    { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy, badge: "New" },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, badge: null },
  ];

  return (
    <div className="hidden md:flex h-screen w-72 flex-col fixed left-0 top-0 bg-gradient-to-b from-background via-background to-muted/20 border-r border-border/50 backdrop-blur-xl z-50">
      {/* Futuristic Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))] pointer-events-none" />
      
      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full">
        {/* 1. Logo Section with Glow Effect */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-border/50 backdrop-blur-sm">
          <div className="flex items-center group">
            <div className="relative h-10 w-10 rounded-xl overflow-hidden flex items-center justify-center mr-3 bg-gradient-to-br from-primary to-purple-600 p-0.5">
              <div className="h-full w-full bg-background rounded-xl flex items-center justify-center relative">
                <Image
                  src="/logo/main logo.png"
                  alt="KlarText Logo"
                  width={48}
                  height={48}
                  className="object-contain mix-blend-multiply dark:mix-blend-normal dark:invert"
                />
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent font-serif">
                KlarText
              </span>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
                Learn German
              </p>
            </div>
          </div>
          <SimpleThemeToggle />
        </div>

        {/* 2. Premium Status Banner */}
        {subscription?.isPremium ? (
          <div className="mx-4 mt-4 mb-2">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-pink-500/10 border border-yellow-500/20 p-3">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-pink-500/5 animate-pulse" />
              <div className="relative flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground capitalize">
                    {subscription.subscriptionPlan} Member
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Premium Active
                  </p>
                </div>
                <button
                  onClick={refreshSubscription}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Refresh subscription status"
                >
                  <RefreshCw className={`w-3 h-3 text-yellow-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <Sparkles className="w-4 h-4 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-4 mt-4 mb-2">
            <Link href="/pricing">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/20 p-3 hover:from-primary/20 hover:to-purple-600/20 transition-all cursor-pointer group">
                <div className="relative flex items-center gap-2">
                  <Crown className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground">
                      Upgrade to Premium
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Unlock all lessons
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* 3. Navigation Links */}
        <div className="flex-1 flex flex-col gap-1 px-4 py-2 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className="group relative"
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-purple-600 rounded-r-full" />
                )}
                
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                    isActive
                      ? "bg-gradient-to-r from-primary/10 to-purple-600/10 text-primary shadow-lg shadow-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {/* Hover effect background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <Icon className={`h-5 w-5 relative z-10 transition-transform group-hover:scale-110 ${
                    isActive ? "text-primary" : ""
                  }`} />
                  <span className="relative z-10 flex-1">{item.name}</span>
                  
                  {item.badge && (
                    <span className="relative z-10 text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-purple-600 text-white font-bold">
                      {item.badge}
                    </span>
                  )}
                  
                  {isActive && (
                    <ChevronRight className="h-4 w-4 relative z-10 text-primary" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* 4. User Profile Section */}
        <div className="p-4 border-t border-border/50 backdrop-blur-sm">
          {/* User Info Card */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 p-4 mb-3">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-600/5" />
            <div className="relative flex items-center gap-3">
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate text-foreground">
                  {user?.name || "Student"}
                </p>
                <p className="text-xs text-muted-foreground truncate capitalize flex items-center gap-1">
                  {subscription?.isPremium && (
                    <Crown className="w-3 h-3 text-yellow-500" />
                  )}
                  {user?.role || "Student"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Logout Button */}
          <LiquidButton 
            variant="outline" 
            className="w-full justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900 group"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">Sign Out</span>
          </LiquidButton>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;