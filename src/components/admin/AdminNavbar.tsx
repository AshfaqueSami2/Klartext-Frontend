"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  ChevronDown,
  Target,
  Zap
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";

export default function AdminNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: BarChart3,
      description: "Admin overview",
      gradient: "from-violet-500 to-purple-500"
    },
    {
      name: "Regular Lessons",
      href: "/admin/lessons",
      icon: BookOpen,
      description: "Standard lessons",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      name: "Grammar Lessons",
      href: "/admin/grammar",
      icon: Target,
      description: "Grammar management",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      description: "User management",
      gradient: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <nav className="backdrop-blur-xl bg-gradient-to-r from-background/95 via-background/90 to-background/95 border-b border-white/10 sticky top-0 z-50">
      {/* Futuristic animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-pink-500/5 opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center group">
              <Image
                src="/logo/logo final 1.png"
                alt="KlarText Logo"
                width={140}
                height={56}
                className="h-12 sm:h-14 w-auto object-contain"
                priority
              />
            </Link>
            <motion.div 
              className="hidden md:block"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium rounded-full flex items-center gap-1 shadow-lg shadow-purple-500/30">
                <Zap className="w-3 h-3" />
                Admin
              </span>
            </motion.div>
          </div>

          {/* Desktop Navigation with Futuristic Design */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={item.href}>
                    <Button 
                      variant="ghost" 
                      className="group relative flex items-center space-x-2 px-4 py-2 hover:bg-white/5 backdrop-blur-sm rounded-xl border border-transparent hover:border-white/10 transition-all duration-300 overflow-hidden"
                    >
                      {/* Animated gradient background on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                      
                      <div className="relative p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all duration-300">
                        <Icon className="w-4 h-4 transition-transform group-hover:scale-110 group-hover:rotate-3" />
                      </div>
                      <span className="relative font-medium">{item.name}</span>
                      
                      {/* Hover shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-[-100%] group-hover:translate-x-[100%]" 
                           style={{ transition: 'transform 0.6s ease-in-out' }} />
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Right side actions with Futuristic Design */}
          <div className="flex items-center space-x-3">
            {/* Home Link with Gradient */}
            <Link href="/">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" className="hidden sm:flex items-center space-x-2 border-white/10 hover:border-purple-500/50 bg-white/5 hover:bg-purple-500/10 backdrop-blur-sm transition-all duration-300">
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Button>
              </motion.div>
            </Link>

            {/* Admin Menu Dropdown with Gradient */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-1 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-xl backdrop-blur-sm transition-all duration-300">
                  <div className="p-1.5 rounded-lg bg-white/5">
                    <Settings className="w-4 h-4" />
                  </div>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl border-white/10">
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="flex items-center space-x-2 hover:bg-purple-500/10 cursor-pointer">
                    <Users className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/analytics" className="flex items-center space-x-2 hover:bg-blue-500/10 cursor-pointer">
                    <BarChart3 className="w-4 h-4" />
                    <span>System Analytics</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/analytics/user" className="flex items-center space-x-2 hover:bg-cyan-500/10 cursor-pointer">
                    <Users className="w-4 h-4" />
                    <span>User Analytics</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="flex items-center space-x-2 hover:bg-purple-500/10 cursor-pointer">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden hover:bg-white/5 border border-transparent hover:border-white/10 rounded-xl"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <div>{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
              
              {/* Mobile Home Link */}
              <Link
                href="/"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                <div>
                  <div>Home</div>
                  <div className="text-xs text-gray-500">Go to main site</div>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}