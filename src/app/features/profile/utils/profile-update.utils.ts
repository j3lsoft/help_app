import { DEFAULT_PROFILE_IMAGE_PATH } from '../constants/profile.constants';
import { UserProfileFormData } from '../models/profile-form.model';
import { UpdateProfileDto } from '../models/update-profile.dto';

/**
 * Builds the update payload by comparing current form data with initial data
 * Only includes fields that have actually changed to minimize API payload
 */
export function buildUpdatePayload(
  formData: UserProfileFormData,
  initialData: UserProfileFormData & { profileImage: string },
  currentImage: string,
  resolvedAvatar: string
): UpdateProfileDto {
  const avatarPatch = buildAvatarPatch(
    initialData,
    currentImage,
    resolvedAvatar
  );

  const updateDto: UpdateProfileDto = {
    ...(formData.displayName !== initialData.displayName && {
      displayName: formData.displayName,
    }),
    ...(formData.username !== initialData.username && {
      username: formData.username,
    }),
    ...(formData.bio !== initialData.bio && { bio: formData.bio }),
    ...(formData.birthDate !== initialData.birthDate && {
      birthDate: formData.birthDate,
    }),
    ...avatarPatch,
  };

  return updateDto;
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
