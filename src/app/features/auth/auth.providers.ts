import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { AUTH_STATE_TOKEN } from '@core/models/auth-state.interface';
import { AuthService } from './services/auth.service';

export const AUTH_PROVIDERS: EnvironmentProviders = makeEnvironmentProviders([
  {
    provide: AUTH_STATE_TOKEN,
    useExisting: AuthService,
  },
]);
