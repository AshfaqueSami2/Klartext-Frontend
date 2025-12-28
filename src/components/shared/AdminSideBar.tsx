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
  PlusCircle, // New Icon
  Users // New Icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SimpleThemeToggle } from "@/components/theme-toggle";

const AdminSideBar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // 1. Define Student Links
  const studentLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Vocabulary", href: "/dashboard/vocabulary", icon: BookMarked },
    { name: "My Profile", href: "/dashboard/profile", icon: Users },
    { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  ];

  // 2. Define Admin Links
  const adminLinks = [
    { name: "Admin Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Create Lesson", href: "/admin/createlesson", icon: PlusCircle },
    { name: "Manage Lessons", href: "/admin/lessons", icon: BookOpen },
    { name: "My Profile", href: "/admin/profile", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  // 3. Choose which links to show
  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <div className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-card border-border z-50">
      <div className="h-16 flex items-center justify-between px-6 border-b border-border">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center mr-3 relative">
            <Image
              src="/logo/klartext logo.png"
              alt="KlarText Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold text-foreground font-serif">KlarText</span>
          {user?.role === 'admin' && <span className="ml-2 text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Admin</span>}
        </div>
        <SimpleThemeToggle />
      </div>

      <div className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 text-xs">
            {user?.name?.[0] || "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate text-foreground">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate capitalize">{user?.role}</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-border"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
};

export default AdminSideBar;