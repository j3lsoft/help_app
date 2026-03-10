import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterPage } from './register.page';
import { AuthApiService } from '../../services/auth-api.service';
import { AppStorageService } from 'src/app/core/services/storage/app-storage.service';
import { of } from 'rxjs';

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
});
