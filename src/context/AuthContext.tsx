"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios"; // Your configured axios instance
import { IUser } from "@/types"; // The interfaces we created earlier
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner"; // or any toast library you installed

// 1. Define the Shape of our Context
interface AuthContextType {
  user: IUser | null;
  isLoading: boolean;
  login: (token: string, skipToast?: boolean) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. The Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Helper function to fetch full user profile
  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/user/me");
      if (response.data.success && response.data.data) {
        const profileData = response.data.data;
        setUser(prev => prev ? {
          ...prev,
          name: profileData.name || prev.name,
          email: profileData.email || prev.email,
          profileImage: profileData.profileImage,
        } : null);
      }
    } catch (error) {
      // Profile fetch failed, keep using basic info
      console.log("Could not fetch full profile");
    }
  };

  // 3. Check for Token on Page Load (The "Persist" Logic)
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");

      if (token) {
        try {
          // A. Decode token to check expiration/role
          const decoded: any = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp < currentTime) {
            // Token expired
            handleLogout();
          } else {
            // B. Token is valid, set basic user info
            setUser({
              _id: decoded.userId,
              email: "",
              role: decoded.role,
              name: "User",
            });
            
            // C. Fetch full profile with profileImage
            await fetchUserProfile();
            
            // D. Redirect to appropriate dashboard if on login/register page
            const currentPath = window.location.pathname;
            if (currentPath === '/login' || currentPath === '/register') {
              if (decoded.role === 'admin') {
                router.push("/admin");
              } else {
                router.push("/dashboard");
              }
            }
          }
        } catch (error) {
          handleLogout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // 4. Login Function (Called by Login Page after success)
  const login = async (token: string, skipToast = false) => {
    localStorage.setItem("accessToken", token);
    
    try {
        const decoded: any = jwtDecode(token);
        setUser({
          _id: decoded.userId,
          role: decoded.role,
          name: "User", 
          email: "",
        });
        
        // Fetch full profile with profileImage
        await fetchUserProfile();
        
        if (!skipToast) {
          toast.success("Welcome back!");
        }
        
        // Redirect based on user role
        if (decoded.role === 'admin') {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
    } catch (e) {
        // If token is garbage, don't redirect
        toast.error("Login Error: Invalid Token");
    }
};
  // 5. Logout Function - Enhanced for cookie-based refresh tokens
  const logout = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      
      // Call backend logout to clear refresh token cookies
      if (token) {
        try {
          await api.post("/auth/logout", {}, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true // Important: Send cookies with request
          });
        } catch (error) {
          // Backend logout failed, but continue with frontend cleanup
        }
      }
      
      // Always do frontend cleanup regardless of backend response
      handleLogout();
      toast.info("Logged out successfully");
      
    } catch (error) {
      // Even if everything fails, clear frontend state
      handleLogout();
      toast.info("Logged out");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken"); // If you store it
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser: fetchUserProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

// 6. Custom Hook to use this easily in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};