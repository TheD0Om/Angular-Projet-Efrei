import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Gestion globale des erreurs navigateur
    provideBrowserGlobalErrorListeners(),

    // Optimisation des changements (coalescing events)
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router avec toutes les routes
    provideRouter(routes),

    // HttpClient avec intercepteur Auth
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
  ]
};
