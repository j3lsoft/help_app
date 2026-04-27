import {
  AuthUserDto,
  LoginResponseDto,
  LoginUserResponseDto,
} from '../../features/auth/models/auth.dto';

/**
 * Adapter for transforming authentication API responses to internal models.
 * Separates transformation logic from service concerns.
 */
export class AuthResponseAdapter {
  static transformLoginResponse(response: LoginResponseDto): {
    accessToken: string;
    user: AuthUserDto | null;
  } {
    return {
      accessToken: response.accessToken,
      user: response.user ? this.transformLoginUserToAuth(response.user) : null,
    };
  }

  static transformLoginUserToAuth(
    loginUser: LoginUserResponseDto
  ): AuthUserDto {
    return {
      id: loginUser.id,
      email: loginUser.email,
      emailVerified: loginUser.emailVerified,
      username: loginUser.username,
      displayName: loginUser.displayName,
      avatarUrl:
        typeof loginUser.avatarUrl === 'string' ? loginUser.avatarUrl : null,
    };
  }
}
