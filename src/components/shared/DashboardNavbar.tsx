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
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section - Title and Breadcrumb */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Logo */}
          <Link href="/dashboard" className="hidden sm:block hover:opacity-80 transition-opacity">
            <Image
              src="/logo/main logo.png"
              alt="KlarText Logo"
              width={45}
              height={45}
              className="object-contain mix-blend-multiply dark:mix-blend-normal dark:invert"
              priority
            />
          </Link>

          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {getPageTitle()}
            </h1>
            <p className="text-xs text-muted-foreground">
              Welcome back, {user?.name || 'Student'}!
            </p>
          </div>
        </div>

        {/* Center Section - Search (optional) */}
        {showSearch && (
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
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
        <div className="flex items-center gap-3">
          {/* Premium Badge or Upgrade Button */}
          {subscription?.isPremium ? (
            <button
              type="button"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover:from-yellow-500/20 hover:to-orange-500/20 transition-all cursor-pointer"
              onClick={() => setShowPackageModal(true)}
            >
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-bold text-foreground capitalize">
                {subscription.subscriptionPlan}
              </span>
              <Sparkles className="w-3 h-3 text-yellow-500" />
            </button>
          ) : (
            <Link href="/pricing">
              <Button 
                size="sm" 
                className="hidden sm:flex gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                <Crown className="w-4 h-4" />
                <span className="font-semibold">Upgrade</span>
              </Button>
            </Link>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 hover:bg-red-600 text-[10px]"
            >
              3
            </Badge>
          </Button>

          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <SimpleThemeToggle />
          </div>

          {/* User Avatar */}
          <Link href="/dashboard/profile">
            <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:scale-105 transition-transform shadow-lg">
              {user?.name?.[0]?.toUpperCase() || "U"}
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
          <div className="p-4 space-y-2">
            <Link href="/pricing">
              <Button 
                size="sm" 
                className="w-full gap-2 bg-gradient-to-r from-primary to-purple-600"
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
