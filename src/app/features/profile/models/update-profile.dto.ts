export interface UpdateProfileDto {
  username?: string;
  displayName?: string;
  birthDate?: string;
  avatarUrl?: string | null;
  bio?: string;
}

export interface ProfileValidationError {
  field: string;
  message: string;
}

export interface ProfileUpdateError {
  code: string;
  details?: ProfileValidationError[];
  message?: string;
}
