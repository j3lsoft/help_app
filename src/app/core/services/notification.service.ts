import { Injectable, inject } from '@angular/core';
import { ToastController, ToastOptions } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircle,
  checkmarkCircle,
  informationCircle,
  warning,
} from 'ionicons/icons';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly toastCtrl = inject(ToastController);

  constructor() {
    addIcons({ alertCircle, checkmarkCircle, informationCircle, warning });
  }

  private readonly defaultOptions: ToastOptions = {
    duration: 3000,
    position: 'bottom',
    buttons: [
      {
        text: 'OK',
        role: 'cancel',
      },
    ],
  };

  async show(
    message: string,
    type: NotificationType = 'info',
    duration?: number
  ): Promise<void> {
    const options: ToastOptions = {
      ...this.defaultOptions,
      message,
      duration: duration ?? this.defaultOptions.duration,
      color: this.getColor(type),
      icon: this.getIcon(type),
    };

    const toast = await this.toastCtrl.create(options);
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

  private getColor(type: NotificationType): string {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'medium';
    }
  }

  private getIcon(type: NotificationType): string | undefined {
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
