"use server";

import api from "@/lib/axios";

// Helper to set headers since interceptors might not work on server actions
const getAuthHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` }
});

/**
 * SERVER ACTION: Fetch Translation
 */
export async function getTranslationAction(text: string) {
  try {
    // Note: If this route is protected, you might need to pass the token here too.
    // If it's public, this is fine.
    const response = await api.post('/translation/word', { text });
    
    if (response.data?.success) {
      return { 
        success: true, 
        translation: response.data.data.translation 
      };
    }
    
    return { success: false, error: "Invalid response format" };
  } catch (error) {
    console.error("Server Action Error:", error);
    return { success: false, error: "Failed to connect to translation service" };
  }
}

/**
 * SERVER ACTION: Save to Vocabulary
 * ⚠️ UPDATE: Now accepts 'token' as an argument
 */
export async function saveWordAction(word: string, meaning: string | null, lessonId: string, token: string) {
  try {
    if (!token) {
      return { success: false, error: "No authentication token found" };
    }

    // We manually pass the header because the axios interceptor 
    // usually relies on localStorage, which doesn't exist here.
    await api.post("/vocab/add", {
      word,
      meaning: meaning || "No translation",
      lessonId
    }, getAuthHeaders(token)); // <--- Pass Headers Here

    // Optional: Revalidate
    // revalidatePath(`/read/${lessonId}`); 
    
    return { success: true };
  } catch (error: any) {
    // Check for specific backend errors (like Duplicate 409)
    if (error.response?.status === 409) {
        return { success: false, error: "ALREADY_SAVED" };
    }
    
    console.error("Save Word Error:", error.response?.data || error.message);
    return { success: false, error: "Failed to save word" };
  }
}