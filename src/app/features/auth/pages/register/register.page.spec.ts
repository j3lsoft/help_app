import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterPage } from './register.page';
import { AuthApiService } from '../../services/auth-api.service';
import { AppStorageService } from 'src/app/core/services/storage/app-storage.service';
import { throwError } from 'rxjs';

describe('RegisterPage', () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;
  let authApiMock: jasmine.SpyObj<AuthApiService>;
  let storageMock: jasmine.SpyObj<AppStorageService>;
  let routerMock: jasmine.SpyObj<Router>;
  let navCtrlMock: jasmine.SpyObj<NavController>;

  beforeEach(async () => {
    authApiMock = jasmine.createSpyObj('AuthApiService', ['register']);
    storageMock = jasmine.createSpyObj('AppStorageService', ['setString']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    navCtrlMock = jasmine.createSpyObj('NavController', ['back']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RegisterPage],
      providers: [
        { provide: AuthApiService, useValue: authApiMock },
        { provide: AppStorageService, useValue: storageMock },
        { provide: Router, useValue: routerMock },
        { provide: NavController, useValue: navCtrlMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form when empty', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('should validate password strength', () => {
    const passwordControl = component.form.controls.password;

    passwordControl.setValue('12345678');
    expect(passwordControl.hasError('weakPassword')).toBeTrue();

    passwordControl.setValue('password!');
    expect(passwordControl.hasError('weakPassword')).toBeTrue();

    passwordControl.setValue('password123!');
    expect(passwordControl.errors).toBeNull();
  });

  it('should render dynamic birthDate message from server validation metadata', async () => {
    authApiMock.register.and.returnValue(
      throwError(() => ({
        status: 422,
        handled: false,
        details: {
          validation: {
            fieldErrors: {
              birthDate: [
                {
                  message: 'You must be at least 16 years old to register',
                  meta: { minAge: 13 },
                },
              ],
            },
          },
        },
      }))
    );

    component.form.setValue({
      name: 'John Doe',
      username: 'johndoe',
      birthDate: '2000-01-01',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    await component.onSubmit();

    expect(component.form.controls.birthDate.getError('serverError')).toBe(
      'You must be at least 13 years old to register'
    );
  });
});
