import { DEFAULT_PROFILE_IMAGE_PATH } from '../constants/profile.constants';

/**
 * Generates user initials from their display name
 * Returns '?' if name is empty
 * @param name - The user's display name
 * @returns Up to 2 uppercase initials (e.g., "John Doe" -> "JD")
 */
export function getUserInitials(name: string | null | undefined): string {
  if (!name || name.trim() === '') return '?';

  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Checks if a user image URL is valid (not null, not default placeholder)
 * @param imageUrl - The image URL to validate
 * @returns true if the image is valid and not a placeholder
 */
export function isValidUserImage(imageUrl: string | null | undefined): boolean {
  if (!imageUrl || imageUrl.trim() === '') {
    return false;
  }

  return (
    imageUrl !== DEFAULT_PROFILE_IMAGE_PATH &&
    !imageUrl.includes('default-user')
  );
}
