import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { AuthService } from '../features/auth/services/auth.service';
import { AUTH_STATE_TOKEN } from './models/auth-state.interface';

/**
 * Core providers for the application.
 * This file centralizes the registration of core services and their tokens.
 */
export const CORE_PROVIDERS: EnvironmentProviders = makeEnvironmentProviders([
  {
    provide: AUTH_STATE_TOKEN,
    useExisting: AuthService,
  },
]);
