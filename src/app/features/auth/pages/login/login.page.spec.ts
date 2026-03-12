import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthService } from '../../services/auth.service';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authApiMock: jasmine.SpyObj<AuthApiService>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authApiMock = jasmine.createSpyObj('AuthApiService', ['login']);
    authServiceMock = jasmine.createSpyObj('AuthService', ['login']);
    routerMock = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, LoginPage],
      providers: [
        { provide: AuthApiService, useValue: authApiMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form when empty', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('should show error on failed login', async () => {
    const errorResponse = new HttpErrorResponse({
      status: 401,
      error: { message: 'Invalid email or password.' },
    });
    authApiMock.login.and.returnValue(throwError(() => errorResponse));

    component.form.patchValue({
      emailOrUsername: 'test@test.com',
      password: 'password123',
    });

    await component.onSubmit();

    expect(component.serverError()).toBe('Invalid email or password.');
    expect(component.isSubmitting()).toBeFalse();
  });

  it('should call authService.login and navigate on success', async () => {
    const loginResponse = {
      accessToken: 'token',
      user: {
        id: '1',
        name: 'Test',
        email: 'test@test.com',
        emailVerified: true,
        image: null,
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
});
