"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Bell, 
  Search, 
  Crown,
  Menu,
  X,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SimpleThemeToggle } from "@/components/theme-toggle";
import { useSubscriptionStatus } from "@/hooks/usePayment";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface DashboardNavbarProps {
  title?: string;
  showSearch?: boolean;
}

export default function DashboardNavbar({ title, showSearch = false }: DashboardNavbarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { subscription } = useSubscriptionStatus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);

  // Get page title based on route if not provided
  const getPageTitle = () => {
    if (title) return title;
    
    const routes: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/lessons': 'Lesson Library',
      '/grammar': 'Grammar Guide',
      '/myVocabulary': 'My Vocabulary',
      '/dashboard/profile': 'Profile',
      '/dashboard/leaderboard': 'Leaderboard',
      '/dashboard/settings': 'Settings',
      '/pricing': 'Pricing Plans',
    };

    return routes[pathname] || 'KlarText';
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        {/* Left Section - Title and Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          {/* Mobile Menu Toggle - Hidden when Sidebar handles this */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden flex-shrink-0 hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Logo */}
          <Link href="/dashboard" className="hidden sm:block flex-shrink-0 hover:opacity-90 transition-opacity">
            <Image
              src="/logo/logo final 1.png"
              alt="KlarText Logo"
              width={120}
              height={48}
              className="h-12 sm:h-14 w-auto object-contain"
              priority
            />
          </Link>

          <div className="min-w-0 ml-12 md:ml-0">
            <h1 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text truncate">
              {getPageTitle()}
            </h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              Welcome back, {user?.name || 'Student'}!
            </p>
          </div>
        </div>

        {/* Center Section - Search (optional) */}
        {showSearch && (
          <div className="hidden lg:flex flex-1 max-w-md mx-4 xl:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lessons, vocabulary..."
                className="pl-10 bg-muted/50 border-border/50 focus:bg-background"
              />
            </div>
          </div>
        )}

        {/* Right Section - Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
          {/* Premium Badge or Upgrade Button */}
          {subscription?.isPremium ? (
            <button
              type="button"
              className="hidden xs:flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover:from-yellow-500/20 hover:to-orange-500/20 transition-all cursor-pointer"
              onClick={() => setShowPackageModal(true)}
            >
              <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
              <span className="text-[10px] sm:text-xs font-bold text-foreground capitalize hidden sm:inline">
                {subscription.subscriptionPlan}
              </span>
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-500 hidden sm:block" />
            </button>
          ) : (
            <Link href="/pricing">
              <Button 
                size="sm" 
                className="hidden xs:flex gap-1 sm:gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-xs sm:text-sm px-2 sm:px-3"
              >
                <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-semibold hidden sm:inline">Upgrade</span>
              </Button>
            </Link>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            <Badge 
              className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 bg-red-500 hover:bg-red-600 text-[8px] sm:text-[10px]"
            >
              3
            </Badge>
          </Button>

          {/* Theme Toggle */}
          <SimpleThemeToggle />

          {/* User Avatar */}
          <Link href="/dashboard/profile">
            <div className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-lg">
              {user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.name || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-background" />
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
          <div className="p-3 sm:p-4 space-y-2">
            <Link href="/pricing">
              <Button 
                size="sm" 
                className="w-full gap-2 bg-gradient-to-r from-primary to-purple-600 text-sm"
              >
                <Crown className="w-4 h-4" />
                <span>Upgrade to Premium</span>
              </Button>
            </Link>
            
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-10 bg-muted/50"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Package Modal */}
      <Dialog open={showPackageModal} onOpenChange={setShowPackageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Current Subscription</DialogTitle>
          </DialogHeader>
          {subscription && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-lg capitalize">{subscription.subscriptionPlan} Member</span>
                <Badge className="bg-green-100 text-green-700 ml-2">Active</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Your current package is <b>{subscription.subscriptionPlan}</b>.
              </div>
              {/* Upgrade options */}
              {subscription.subscriptionPlan === 'monthly' && (
                <Link href="/pricing?upgrade=yearly">
                  <Button className="mt-2 w-full" variant="outline">
                    Upgrade to Yearly
                  </Button>
                </Link>
              )}
              {(subscription.subscriptionPlan === 'monthly' || subscription.subscriptionPlan === 'yearly') && (
                <Link href="/pricing?upgrade=lifetime">
                  <Button className="mt-2 w-full" variant="outline">
                    Upgrade to Lifetime
                  </Button>
                </Link>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowPackageModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
