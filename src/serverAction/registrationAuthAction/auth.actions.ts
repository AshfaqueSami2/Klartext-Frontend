// "use server";

// import api from "@/lib/axios"; // Your configured Axios instance

// interface RegisterPayload {
//   name: string;
//   email: string;
//   password: string;
// }

// export async function registerAction(data: RegisterPayload) {
//   try {
   
//     const response = await api.post("/user/create-student", data);

//     if (response.data?.success) {
//       return { success: true };
//     }

//     return { 
//       success: false, 
//       error: response.data?.message || "Registration failed" 
//     };

//   } catch (error: any) {
//     console.error("Registration Action Error:", error?.response?.data || error.message);
    
//     // Return a readable error message from the backend if available
//     return { 
//       success: false, 
//     };
//   }
// }


"use server";

import api from "@/lib/axios"; // Your configured Axios instance

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export async function registerAction(data: RegisterPayload) {
  try {
    // 1. Prepare Data
    // We explicitly add 'role: "student"' to pass the Zod Validation Middleware on the backend.
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: "student", // 👈 CRITICAL FIX: Satisfies Zod "expected one of 'admin'|'student'"
    };

    // 2. Call your Node.js Backend
    const response = await api.post("/user/create-student", payload);

    if (response.data?.success) {
      return { success: true };
    }

    return { 
      success: false, 
      error: response.data?.message || "Registration failed" 
    };

  } catch (error: any) {
    console.error("Registration Action Error:", error?.response?.data || error.message);
    
    // Return the actual error message from backend if available
    return { 
      success: false, 
      error: error?.response?.data?.message || "Something went wrong. Please try again." 
    };
  }
}