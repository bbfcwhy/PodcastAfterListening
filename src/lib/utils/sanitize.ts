/**
 * Strip HTML tags from a string for safe plain-text display (XSS-safe).
 * Use for user-supplied content such as episode description and show about.
 */
export function stripHtml(html: string | null | undefined): string {
  if (html == null || typeof html !== "string") return "";

  return html
    // Replace <br> with newline
    .replace(/<br\s*\/?>/gi, "\n")
    // Replace closing paragraph/div with double newline
    .replace(/<\/(p|div)>/gi, "\n\n")
    // Replace closing list item with newline
    .replace(/<\/li>/gi, "\n")
    // Strip all other HTML tags
    .replace(/<[^>]*>/g, "")
    // Decode common entities
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    // Normalize spaces (but keep newlines)
    .replace(/[ \t]+/g, " ")
    // Normalize newlines (max 2 consecutive)
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}
