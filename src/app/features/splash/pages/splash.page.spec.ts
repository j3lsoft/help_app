import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppStorageService } from '../../../core/services/storage/app-storage.service';
import { STORAGE_KEYS } from '../../../core/services/storage/storage-keys';
import { SplashPage } from './splash.page';

describe('SplashPage', () => {
  let component: SplashPage;
  let router: { navigateByUrl: jasmine.Spy };
  let appStorageService: { getBoolean: jasmine.Spy };

  beforeEach(() => {
    router = {
      navigateByUrl: jasmine.createSpy('navigateByUrl'),
    };

    appStorageService = {
      getBoolean: jasmine.createSpy('getBoolean'),
    };

    TestBed.configureTestingModule({
      imports: [SplashPage],
      providers: [
        { provide: Router, useValue: router },
        { provide: AppStorageService, useValue: appStorageService },
      ],
    });

    component = TestBed.createComponent(SplashPage).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to /onboarding when onboarding was not seen', fakeAsync(() => {
    appStorageService.getBoolean.and.resolveTo(false);

    component.ionViewDidEnter();
    tick(2000);

    expect(appStorageService.getBoolean).toHaveBeenCalledWith(
      STORAGE_KEYS.hasSeenOnboarding
    );
    expect(router.navigateByUrl).toHaveBeenCalledWith('/onboarding');
  }));

  it('should navigate to /auth/sign-in when onboarding was seen', fakeAsync(() => {
    appStorageService.getBoolean.and.resolveTo(true);

    component.ionViewDidEnter();
    tick(2000);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/sign-in');
  }));
});
