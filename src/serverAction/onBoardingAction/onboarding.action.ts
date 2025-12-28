"use server";

import api from "@/lib/axios";
import { revalidatePath } from "next/cache";

const getAuthHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` }
});

export async function updateUserLevelAction(level: string, token: string) {
  try {
    if (!token) {
      return { success: false, error: "Authentication required" };
    }

    const response = await api.patch(
      "/students/update-level", 
      { currentLevel: level }, // ✅ FIX: Changed 'level' to 'currentLevel' to match Backend Validation
      getAuthHeaders(token) 
    );

    if (response.data?.success) {
      revalidatePath("/dashboard"); 
      return { success: true };
    }
    
    return { success: false, error: "Failed to update level" };
  } catch (error) {
    console.error("Onboarding Error:", error);
    return { success: false, error: "Connection failed" };
  }
}