/**
 * Utility functions for website URL handling
 * Provides normalization (adding https://) and display formatting (stripping protocol)
 */

/**
 * Adds https:// protocol to a URL if it doesn't have one
 * Returns empty string if input is empty/null
 * @param url - The URL to normalize
 * @returns URL with https:// protocol added if missing
 */
export function normalizeWebsiteUrl(url: string | null | undefined): string {
  if (!url || url.trim() === '') {
    return '';
  }

  const trimmedUrl = url.trim();

  // If URL already has a protocol (http:// or https://), return as-is
  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  // Add https:// prefix
  return `https://${trimmedUrl}`;
}

/**
 * Removes protocol (http:// or https://) from URL for display purposes
 * Returns empty string if input is empty/null
 * @param url - The URL to strip protocol from
 * @returns URL without protocol (e.g., "name.dev" from "https://name.dev")
 */
export function stripWebsiteProtocol(url: string | null | undefined): string {
  if (!url || url.trim() === '') {
    return '';
  }

  const trimmedUrl = url.trim();

  // Remove http:// or https:// protocol
  return trimmedUrl.replace(/^https?:\/\//i, '');
}
