import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  isOnline(): boolean {
    // `navigator` is not available in all runtimes (e.g. SSR/tests).
    if (typeof navigator === 'undefined') return true;
    if (typeof navigator.onLine !== 'boolean') return true;
    return navigator.onLine;
  }
}

