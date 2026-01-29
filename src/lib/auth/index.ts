// Re-export client-side auth functions
export { signIn, type AuthProvider } from "./client";

// Re-export server-side auth functions
export { signOut, getCurrentUser, getSession } from "./server";
