import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { of } from 'rxjs';
import { AppStorageService } from 'src/app/core/services/storage/app-storage.service';
import { AuthApiService } from '../../services/auth-api.service';
import { ForgotPasswordPage } from './forgot-password.page';

describe('ForgotPasswordPage', () => {
  let component: ForgotPasswordPage;
  let fixture: ComponentFixture<ForgotPasswordPage>;
  let authApiMock: jasmine.SpyObj<AuthApiService>;
  let storageMock: jasmine.SpyObj<AppStorageService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authApiMock = jasmine.createSpyObj('AuthApiService', [
      'requestPasswordReset',
    ]);
    storageMock = jasmine.createSpyObj('AppStorageService', ['setString']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ForgotPasswordPage],
      providers: [
        { provide: AuthApiService, useValue: authApiMock },
        { provide: AppStorageService, useValue: storageMock },
        { provide: Router, useValue: routerMock },
        {
          provide: NavController,
          useValue: jasmine.createSpyObj('NavController', ['back']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not call API when form is invalid', async () => {
    await component.onSubmit();
    expect(authApiMock.requestPasswordReset).not.toHaveBeenCalled();
  });

  it('should call API and navigate to reset password on success', async () => {
    authApiMock.requestPasswordReset.and.returnValue(of(void 0));
    storageMock.setString.and.returnValue(Promise.resolve());

    component.form.setValue({ email: 'test@test.com' });

    await component.onSubmit();

    expect(authApiMock.requestPasswordReset).toHaveBeenCalledWith({
      email: 'test@test.com',
    });
    expect(routerMock.navigate).toHaveBeenCalled();
  });
});
