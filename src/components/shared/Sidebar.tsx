"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  Settings, 
  LogOut, 
  BookMarked,
  Home,
  Library,
  GraduationCap
} from "lucide-react";
import { LiquidButton } from "@/components/ui/liquid-button";
import { SimpleThemeToggle } from "@/components/theme-toggle";

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Library", href: "/lessons", icon: Library },
    { name: "Grammar", href: "/grammar", icon: GraduationCap },
    { name: "My Vocabulary", href: "/myVocabulary", icon: BookMarked },
    { name: "Profile", href: "/dashboard/profile", icon: BookOpen },
    { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-card z-50">
      {/* 1. Logo Section */}
      <div className="h-16 flex items-center justify-between px-6 border-b">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center mr-3 relative">
            <Image
              src="/logo/klartext logo.png"
              alt="KlarText Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold text-primary font-serif">KlarText</span>
        </div>
        <SimpleThemeToggle />
      </div>

      {/* 2. Navigation Links */}
      <div className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-gray-500"}`} />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* 3. User Footer */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground font-bold border border-accent/20 text-xs">
            {user?.name?.[0] || "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate text-gray-900">{user?.name || "Student"}</p>
            <p className="text-xs text-gray-500 truncate capitalize">{user?.role || "Student"}</p>
          </div>
        </div>
        
        <LiquidButton 
          variant="outline" 
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </LiquidButton>
      </div>
    </div>
  );
};

export default Sidebar;