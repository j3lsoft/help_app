import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { VerifyAccountPage } from './verify-account.page';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthService } from '../../services/auth.service';
import { AppStorageService } from 'src/app/core/services/storage/app-storage.service';

describe('VerifyAccountPage', () => {
  let component: VerifyAccountPage;
  let fixture: ComponentFixture<VerifyAccountPage>;
  let authApiMock: jasmine.SpyObj<AuthApiService>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let storageMock: jasmine.SpyObj<AppStorageService>;
  let routerMock: jasmine.SpyObj<Router>;
  let routeMock: any;

  beforeEach(async () => {
    authApiMock = jasmine.createSpyObj('AuthApiService', [
      'verifyEmail',
      'resendVerification',
    ]);
    authServiceMock = jasmine.createSpyObj('AuthService', ['login']);
    storageMock = jasmine.createSpyObj('AppStorageService', ['getString']);
    routerMock = jasmine.createSpyObj('Router', ['navigateByUrl']);
    routeMock = {
      snapshot: {
        queryParamMap: {
          get: (key: string) => (key === 'email' ? 'test@test.com' : null),
        },
      },
    };

    storageMock.getString.and.returnValue(Promise.resolve('test@test.com'));

    await TestBed.configureTestingModule({
      imports: [VerifyAccountPage],
      providers: [
        { provide: AuthApiService, useValue: authApiMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: AppStorageService, useValue: storageMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        {
          provide: NavController,
          useValue: jasmine.createSpyObj('NavController', ['back']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyAccountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize email from route', () => {
    expect(component.email()).toBe('test@test.com');
  });
});
