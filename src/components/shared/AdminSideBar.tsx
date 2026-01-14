"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  Settings, 
  LogOut, 
  BookMarked,
  PlusCircle,
  Users,
  Sparkles,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SimpleThemeToggle } from "@/components/theme-toggle";

const AdminSideBar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // 1. Define Student Links
  const studentLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, gradient: "from-blue-500 to-cyan-500" },
    { name: "My Vocabulary", href: "/dashboard/vocabulary", icon: BookMarked, gradient: "from-purple-500 to-pink-500" },
    { name: "My Profile", href: "/dashboard/profile", icon: Users, gradient: "from-orange-500 to-red-500" },
    { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy, gradient: "from-yellow-500 to-orange-500" },
  ];

  // 2. Define Admin Links
  const adminLinks = [
    { name: "Admin Overview", href: "/admin", icon: LayoutDashboard, gradient: "from-violet-500 to-purple-500" },
    { name: "Create Lesson", href: "/admin/createlesson", icon: PlusCircle, gradient: "from-emerald-500 to-teal-500" },
    { name: "Manage Lessons", href: "/admin/lessons", icon: BookOpen, gradient: "from-blue-500 to-indigo-500" },
    { name: "My Profile", href: "/admin/profile", icon: Users, gradient: "from-pink-500 to-rose-500" },
    { name: "Settings", href: "/admin/settings", icon: Settings, gradient: "from-slate-500 to-zinc-500" },
  ];

  // 3. Choose which links to show
  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <div className="hidden md:flex h-screen w-56 lg:w-64 flex-col fixed left-0 top-0 z-50 backdrop-blur-xl bg-gradient-to-b from-background/95 via-background/90 to-background/95 border-r border-white/10">
      {/* Futuristic animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-pink-500/5 opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      
      {/* Logo Header */}
      <div className="relative h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Image
              src="/logo/logo final 1.png"
              alt="KlarText Logo"
              width={120}
              height={48}
              className="h-12 sm:h-14 w-auto object-contain"
              priority
            />
          </Link>
          {user?.role === 'admin' && (
            <span className="text-[10px] sm:text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              Admin
            </span>
          )}
        </div>
        <SimpleThemeToggle />
      </div>

      <div className="relative flex-1 flex flex-col gap-1.5 sm:gap-2 p-3 sm:p-4 overflow-y-auto scrollbar-hide">
        {links.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-r " + item.gradient + " text-white shadow-lg shadow-purple-500/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {/* Animated background for active state */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r opacity-50"
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                )}
                
                {/* Icon with glow effect */}
                <div className={`relative z-10 p-2 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? "bg-white/20 shadow-lg" 
                    : "bg-white/5 group-hover:bg-white/10"
                }`}>
                  <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                    isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                  }`} />
                </div>
                
                <span className="relative z-10">{item.name}</span>
                
                {/* Hover glow effect */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-[-100%] group-hover:translate-x-[100%]" 
                       style={{ transition: 'transform 0.6s ease-in-out, opacity 0.3s' }} />
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="relative p-4 border-t border-white/10 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 backdrop-blur-sm">
        {/* Futuristic User Card */}
        <motion.div 
          className="flex items-center gap-3 mb-4 px-3 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
        >
          <motion.div 
            className="relative h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold border-2 border-white/20 shadow-lg"
            animate={{ 
              boxShadow: [
                "0 0 10px rgba(168, 85, 247, 0.3)",
                "0 0 20px rgba(59, 130, 246, 0.5)",
                "0 0 10px rgba(168, 85, 247, 0.3)",
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300" />
            {user?.name?.[0] || "U"}
          </motion.div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate capitalize flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {user?.role}
            </p>
          </div>
        </motion.div>
        
        <Button 
          variant="outline" 
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 border-white/10 hover:border-red-500/50 backdrop-blur-sm transition-all duration-300 group"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
          Log out
        </Button>
      </div>
    </div>
  );
};

export default AdminSideBar;