import {
  LoginResponseDto,
  LoginUserResponseDto,
  MeResponseDto,
} from '../../features/auth/models/auth.dto';

/**
 * Adapter for transforming authentication API responses to internal models.
 * Separates transformation logic from service concerns.
 */
export class AuthResponseAdapter {
  static transformLoginResponse(response: LoginResponseDto): {
    accessToken: string;
    user: MeResponseDto | null;
  } {
    return {
      accessToken: response.accessToken,
      user: response.user ? this.transformLoginUserToMe(response.user) : null,
    };
  }

  static transformLoginUserToMe(
    loginUser: LoginUserResponseDto
  ): MeResponseDto {
    return {
      id: loginUser.id,
      email: loginUser.email,
      emailVerified: loginUser.emailVerified,
      username: loginUser.username,
      displayName: loginUser.displayName,
      avatarUrl:
        typeof loginUser.avatarUrl === 'string' ? loginUser.avatarUrl : null,
      birthDate: null,
      bio: null,
    };
  }
}
