import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { IonImg, IonText } from '@ionic/angular/standalone';
import { LikedPhoto } from '../../../models/notification.model';

@Component({
  selector: 'app-like-photos-notification',
  template: `
    <div class="like-photos-notification__row">
      <ion-img
        [src]="userProfilePic()"
        class="like-photos-notification__avatar"
      ></ion-img>
      <div class="like-photos-notification__content">
        <ion-text class="blackColor14SemiBold like-photos-notification__title">
          {{ userName() }} liked {{ likedPhotos().length }} photos
        </ion-text>

        <div class="like-photos-notification__liked-photos">
          @for (photo of displayPhotos(); track photo.photo) {
          <div>
            <ion-img
              [src]="photo.photo"
              class="like-photos-notification__like-photo"
              [class.like-photos-notification__like-photo--small]="
                likedPhotos().length >= 4
              "
              [class.like-photos-notification__like-photo--large]="
                likedPhotos().length < 4
              "
            ></ion-img>
          </div>
          }
        </div>

        <ion-text class="grayColor12Regular like-photos-notification__time">
          {{ notificationTime() }}
        </ion-text>
      </div>
    </div>
  `,
  styleUrls: ['./like-photos-notification.component.scss'],
  imports: [IonImg, IonText],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LikePhotosNotificationComponent {
  userProfilePic = input.required<string>();
  userName = input.required<string>();
  likedPhotos = input.required<LikedPhoto[]>();
  notificationTime = input.required<string>();

  displayPhotos = computed(() => {
    const photos = this.likedPhotos();
    return photos.length >= 4 ? photos.slice(0, 4) : photos;
  });
}
