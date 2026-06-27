import { ErrorMapConfig } from '../../../core/errors/error-map.interface';

export type ProfileErrorContext =
  | 'profile'
  | 'update-profile'
  | 'avatar-upload';

/** Shared error messages to avoid duplication */
const SESSION_EXPIRED_MESSAGE = 'Session expired. Please login again.';

export const PROFILE_ERROR_MAP: Record<ProfileErrorContext, ErrorMapConfig> = {
  profile: {
    byCode: {
      PROFILE_NOT_FOUND: 'Profile not found.',
      USER_NOT_FOUND: 'User not found.',
    },
    byStatus: {
      401: SESSION_EXPIRED_MESSAGE,
      403: SESSION_EXPIRED_MESSAGE,
      404: 'Profile not found.',
    },
    fallback: 'Failed to load profile. Please try again.',
  },
  'update-profile': {
    byCode: {
      USERNAME_ALREADY_EXISTS: 'Username is already taken.',
      INVALID_DISPLAY_NAME:
        'Display name is too long or contains invalid characters.',
      INVALID_BIO: 'Bio is too long. Maximum 500 characters.',
    },
    byStatus: {
      401: SESSION_EXPIRED_MESSAGE,
      422: 'Invalid data. Please check your information.',
      409: 'Username is already taken.',
    },
    fallback: 'Failed to update profile. Please try again.',
  },
  'avatar-upload': {
    byCode: {
      FILE_TOO_LARGE: 'Image is too large. Maximum size is 5MB.',
      INVALID_FORMAT: 'Invalid image format. Use JPG, PNG or WebP.',
      UPLOAD_FAILED: 'Failed to upload image. Please try again.',
      FILE_NOT_FOUND: 'File not found.',
      UNAUTHORIZED_FILE_ACCESS: 'You do not have access to this file.',
      INVALID_FILE: 'File is invalid or does not meet requirements.',
      STORAGE_PROVIDER_ERROR: 'Storage service error.',
      INVALID_UPLOAD_STRATEGY: 'Upload strategy not enabled.',
      PERMISSION_DENIED:
        'Camera/Gallery permission denied. Please enable permissions in settings.',
      CAMERA_ERROR: 'Failed to capture image.',
    },
    byStatus: {
      400: 'Invalid file format or size.',
      403: 'Camera/Gallery permission denied.',
      413: 'File is too large.',
      500: 'Upload failed. Please try again.',
    },
    fallback: 'Failed to upload image. Please try again.',
  },
};
