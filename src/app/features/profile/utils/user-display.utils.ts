/**
 * Generates user initials from their display name
 *
 * @param displayName - The user's display name
 * @returns Initials (up to 2 characters) in uppercase
 */
export function getUserInitials(displayName: string | undefined | null): string {
  if (!displayName) return '?';

  const words = displayName.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Checks if the provided image URL is valid for display
 *
 * @param imageUrl - The image URL to check
 * @returns True if the image is valid for display
 */
export function isValidUserImage(imageUrl: string | undefined | null): boolean {
  if (!imageUrl) {
    return false;
  }

  return (
    imageUrl !== '' &&
    !imageUrl.includes('default-user')
  );
}
