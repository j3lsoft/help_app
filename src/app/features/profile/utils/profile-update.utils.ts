import { DEFAULT_PROFILE_IMAGE_PATH } from '../constants/profile.constants';
import { UserProfileFormData } from '../models/profile-form.model';
import { UpdateProfileDto } from '../models/update-profile.dto';
import { normalizeWebsiteUrl } from './website-url.utils';

/** Options for building profile update payload */
export interface BuildUpdatePayloadOptions {
  /** Current form data from user input */
  formData: UserProfileFormData;
  /** Initial data when form was loaded */
  initialData: UserProfileFormData & { profileImage: string };
  /** Current image URL (may be data URL or remote) */
  currentImage: string;
  /** Resolved avatar URL after upload (if applicable) */
  resolvedAvatar: string;
}

type ProfileField = keyof UserProfileFormData;

/**
 * Builds the update payload by comparing current form data with initial data.
 * Only includes fields that have actually changed to minimize API payload.
 */
export function buildUpdatePayload(
  options: BuildUpdatePayloadOptions
): UpdateProfileDto {
  const { formData, initialData, currentImage, resolvedAvatar } = options;

  const changedFields = getChangedFields(formData, initialData);
  const avatarPatch = buildAvatarPatch(
    initialData,
    currentImage,
    resolvedAvatar
  );

  return {
    ...changedFields,
    ...avatarPatch,
  };
}

/** Returns only the fields that have changed between form and initial data */
function getChangedFields(
  formData: UserProfileFormData,
  initialData: UserProfileFormData
): Partial<Pick<UpdateProfileDto, ProfileField>> {
  const changed: Partial<Pick<UpdateProfileDto, ProfileField>> = {};

  if (formData.displayName !== initialData.displayName) {
    changed.displayName = formData.displayName;
  }
  if (formData.username !== initialData.username) {
    changed.username = formData.username;
  }
  if (formData.bio !== initialData.bio) {
    changed.bio = formData.bio;
  }
  if (formData.website !== initialData.website) {
    changed.website = normalizeWebsiteUrl(formData.website);
  }
  if (formData.birthDate !== initialData.birthDate) {
    changed.birthDate = formData.birthDate;
  }

  return changed;
}

function buildAvatarPatch(
  initial: { profileImage: string },
  currentImage: string,
  resolvedAfterUpload: string
): Pick<UpdateProfileDto, 'avatarUrl'> | Record<string, never> {
  const isRemoteUrl = (url: string) =>
    url.startsWith('http://') || url.startsWith('https://');

  const removed =
    currentImage === DEFAULT_PROFILE_IMAGE_PATH &&
    isRemoteUrl(initial.profileImage);

  if (removed) {
    return { avatarUrl: null };
  }

  if (
    resolvedAfterUpload !== initial.profileImage &&
    isRemoteUrl(resolvedAfterUpload)
  ) {
    return { avatarUrl: resolvedAfterUpload };
  }

  return {};
}
