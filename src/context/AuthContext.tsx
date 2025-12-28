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
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. The Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
            // (Optional: You could call API here to get latest profile image/coins)
            setUser({
              _id: decoded.userId,
              email: "", // Token usually doesn't have email/name unless you put it there
              role: decoded.role,
              name: "User", // Placeholder until you fetch profile
            });
            
            // C. Redirect to appropriate dashboard if on login/register page
            const currentPath = window.location.pathname;
            if (currentPath === '/login' || currentPath === '/register') {
              if (decoded.role === 'admin') {
                router.push("/admin");
              } else {
                router.push("/dashboard");
              }
            }
            
            // D. (Optional) Fetch full profile
            // await fetchUserProfile(decoded.userId); 
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
  const login = (token: string, skipToast = false) => {
    localStorage.setItem("accessToken", token);
    
    try {
        const decoded: any = jwtDecode(token);
        setUser({
          _id: decoded.userId,
          role: decoded.role,
          name: "User", 
          email: "",
        });
        
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
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
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