import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  enableProdMode,
  ErrorHandler,
  inject,
  provideAppInitializer,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  PreloadAllModules,
  provideRouter,
  RouteReuseStrategy,
  withPreloading,
} from '@angular/router';
import { iosTransitionAnimation } from '@ionic/angular';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { GlobalErrorHandler } from './app/core/errors/global-error-handler';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';
import { AUTH_STATE_TOKEN } from './app/core/models/auth-state.interface';
import { AuthService } from './app/features/auth/services/auth.service';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: AUTH_STATE_TOKEN, useExisting: AuthService },
    provideIonicAngular({ navAnimation: iosTransitionAnimation }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return authService.restoreSession();
    }),
  ],
});
