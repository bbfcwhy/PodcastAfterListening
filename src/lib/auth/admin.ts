export function isAdmin(email?: string | null): boolean {
    if (!email) return false;

    // Fallback if env is empty (Debug Mode)
    const adminEmails = process.env.ADMIN_EMAILS || "bbfcwhy@gmail.com";

    // Direct debug in helper
    console.log("[isAdmin] Checking:", email, "against", adminEmails);
    const admins = adminEmails.split(",").map(e => e.trim().toLowerCase());

    return admins.includes(email.toLowerCase());
}
