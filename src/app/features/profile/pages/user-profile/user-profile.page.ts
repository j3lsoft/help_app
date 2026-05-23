import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { toAppError } from '@core/utils/app-error.utils';
import {
  IonContent,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText,
  NavController,
} from '@ionic/angular/standalone';
import { BackHeaderComponent } from '@shared/components/back-header/back-header.component';
import { ShortNumberPipe } from '@shared/pipes/short-number.pipe';
import { addIcons } from 'ionicons';
import { chevronBack, playOutline } from 'ionicons/icons';
import { catchError, map, of, switchMap } from 'rxjs';
import {
  MOCK_ALL_POSTS,
  MOCK_TAGGED_POSTS,
  MOCK_VIDEO_POSTS,
} from '../../data/profile.mock';
import { ProfileErrorFacade } from '../../errors/profile-error.facade';
import { ProfileService } from '../../services/profile.service';
import { filterPostsByTab, TabValue } from '../../utils/post-filter.utils';
import { stripWebsiteProtocol } from '../../utils/website-url.utils';


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
  imports: [
    IonContent,
    IonIcon,
    IonText,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
    BackHeaderComponent,
    ShortNumberPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfilePage {
  private readonly navCtrl = inject(NavController);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly profileService = inject(ProfileService);
  private readonly profileErrorFacade = inject(ProfileErrorFacade);

  selectedTabValue = signal<TabValue>('All');

  // Reactive data loading with rxResource
  readonly userProfile = rxResource({
    stream: () => this.route.paramMap.pipe(
      map((params) => params.get('id') || ''),
      switchMap((id: string) => {
        if (!id) {
          return of(null);
        }
        return this.profileService.getUserProfile(id).pipe(
          map((profile) => ({
            ...profile,
            website: stripWebsiteProtocol(profile.website),
          })),
          catchError((error: unknown) => {
            this.profileErrorFacade.handle(toAppError(error), 'profile');
            return of(null);
          })
        );
      })
    ),
  });

  isFollowing = signal<boolean>(false);

  // Derived state
  filteredPosts = computed(() => {
    return filterPostsByTab(
      this.selectedTabValue(),
      MOCK_ALL_POSTS,
      MOCK_VIDEO_POSTS,
      MOCK_TAGGED_POSTS
    );
  });

  constructor() {
    addIcons({ chevronBack, playOutline });
  }

  goBack() {
    this.navCtrl.back();
  }

  goTo(screen: string) {
    this.router.navigateByUrl(screen);
  }

  onTabChange(event: Event) {
    const value = (event.target as HTMLIonSegmentElement).value as TabValue;
    this.selectedTabValue.set(value);
  }

  toggleFollow() {
    this.isFollowing.update((v) => !v);
  }
}
