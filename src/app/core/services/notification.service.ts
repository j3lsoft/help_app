import { Injectable, inject } from '@angular/core';
import { ToastController, ToastOptions } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircle,
  checkmarkCircle,
  close,
  informationCircle,
  warning,
} from 'ionicons/icons';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

const DEFAULT_DURATION = 3000;

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly toastCtrl = inject(ToastController);

  constructor() {
    addIcons({
      alertCircle,
      checkmarkCircle,
      close,
      informationCircle,
      warning,
    });
  }

  private readonly defaultOptions: ToastOptions = {
    duration: DEFAULT_DURATION,
    position: 'bottom',
    buttons: [
      {
        icon: 'close',
        side: 'end',
        role: 'cancel',
        htmlAttributes: { 'aria-label': 'Dismiss' },
      },
    ],
  };

  async show(
    message: string,
    type: NotificationType = 'info',
    duration?: number
  ): Promise<void> {
    const effectiveDuration = duration ?? DEFAULT_DURATION;

    const options: ToastOptions = {
      ...this.defaultOptions,
      message,
      duration: effectiveDuration,
      icon: this.getIcon(type),
      cssClass: ['app-toast', `app-toast--${type}`],
    };

    const toast = await this.toastCtrl.create(options);
    toast.style.setProperty(
      '--app-toast-duration',
      `${effectiveDuration}ms`
    );
    await toast.present();
  }

  async showSuccess(message: string, duration?: number): Promise<void> {
    await this.show(message, 'success', duration);
  }

  async showError(message: string, duration?: number): Promise<void> {
    await this.show(message, 'error', duration);
  }

  async showWarning(message: string, duration?: number): Promise<void> {
    await this.show(message, 'warning', duration);
  }

  async showInfo(message: string, duration?: number): Promise<void> {
    await this.show(message, 'info', duration);
  }

  private getIcon(type: NotificationType): string {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'information-circle';
    }
  }
}
