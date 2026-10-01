import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AppError } from 'src/app/core/models/app-error.model';
import { ErrorFacade } from '@core/errors/facades/error.facade';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthService } from '../../services/auth.service';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authApiMock: jasmine.SpyObj<AuthApiService>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;
  let errorFacadeMock: jasmine.SpyObj<ErrorFacade>;

  beforeEach(async () => {
    authApiMock = jasmine.createSpyObj('AuthApiService', ['login']);
    authServiceMock = jasmine.createSpyObj('AuthService', ['login']);
    routerMock = jasmine.createSpyObj('Router', ['navigateByUrl']);
    errorFacadeMock = jasmine.createSpyObj('ErrorFacade', [
      'handle',
      'getMessage',
    ]);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, LoginPage],
      providers: [
        { provide: AuthApiService, useValue: authApiMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ErrorFacade, useValue: errorFacadeMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have an invalid form when empty', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('should delegate error to facade on failed login', async () => {
    const errorResponse: AppError = {
      status: 401,
      message: 'Invalid email or password.',
      handled: false,
    };
    authApiMock.login.and.returnValue(throwError(() => errorResponse));

    component.form.patchValue({
      emailOrUsername: 'test@test.com',
      password: 'password123',
    });

    await component.onSubmit();

    expect(errorFacadeMock.handle).toHaveBeenCalled();
    expect(component.isSubmitting()).toBeFalse();
  });

  it('should call authService.login and navigate on success', async () => {
    const loginResponse = {
      accessToken: 'token',
      user: {
        id: '1',
        email: 'test@test.com',
        avatarUrl: null,
        emailVerified: true,
        username: 'test',
        displayName: 'Test',
      },
      accessTokenExpiresAt: '',
    };
    authApiMock.login.and.returnValue(of(loginResponse));
    authServiceMock.login.and.returnValue(Promise.resolve());

    component.form.patchValue({
      emailOrUsername: 'test@test.com',
      password: 'password123',
    });

    await component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalledWith(loginResponse);
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/tabs/home');
  });

  it('surfaces the error and does not navigate when completing the session fails', async () => {
    authApiMock.login.and.returnValue(
      of({ accessToken: 'token', accessTokenExpiresAt: '' })
    );
    authServiceMock.login.and.returnValue(
      Promise.reject(new Error('me failed'))
    );

    component.form.patchValue({
      emailOrUsername: 'test@test.com',
      password: 'password123',
    });

    await component.onSubmit();

    expect(errorFacadeMock.handle).toHaveBeenCalled();
    expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
  });
});
