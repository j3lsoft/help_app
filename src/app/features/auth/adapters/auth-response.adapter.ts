import {
  AuthUserDto,
  LoginResponseDto,
  LoginUserResponseDto,
  MeResponseDto,
} from '../models/auth.dto';

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

  /**
   * Projects the `/me` response onto the minimal auth user kept in session.
   * Used when a login/verify response omits `user` and the session has to be
   * completed from `GET /me`.
   */
  static transformMeResponseToAuth(me: MeResponseDto): AuthUserDto {
    return {
      id: me.id,
      email: me.email,
      emailVerified: me.emailVerified,
      username: me.username,
      displayName: me.displayName,
      avatarUrl: me.avatarUrl,
    };
  }
}
