import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { OnboardingPage } from './onboarding.page';
import { AppStorageService } from '../../../core/services/storage/app-storage.service';

describe('OnboardingPage', () => {
  let component: OnboardingPage;
  let fixture: ComponentFixture<OnboardingPage>;

  beforeEach(async () => {
    const routerMock = jasmine.createSpyObj('Router', ['navigateByUrl']);
    const platformMock = jasmine.createSpyObj('Platform', ['is']);
    platformMock.is.and.returnValue(false);
    const storageMock = jasmine.createSpyObj('AppStorageService', [
      'setBoolean',
    ]);

    await TestBed.configureTestingModule({
      imports: [OnboardingPage],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: Platform, useValue: platformMock },
        { provide: AppStorageService, useValue: storageMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
