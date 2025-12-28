/**
 * Strip HTML tags from a string and return plain text
 */
export function stripHtmlTags(html: string): string {
  if (!html) return "";
  
  // Use DOMParser for browser environments
  if (typeof window !== "undefined") {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  }
  
  // Fallback for server-side: simple regex (less accurate but works)
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Strip HTML and truncate in one step
 */
export function getPlainTextPreview(html: string, maxLength: number = 150): string {
  return truncateText(stripHtmlTags(html), maxLength);
}
