import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { clearServerFieldErrors } from '@core/utils/server-validation-errors.utils';
import { handleInlineFormError } from '@core/utils/form-error-handler.utils';
import { ProfileErrorFacade } from '../../errors/profile-error.facade';
import {
  IonButton,
  IonIcon,
  IonInput,
  IonText,
  IonTextarea,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline } from 'ionicons/icons';
import { UserProfileFormData } from '../../models/profile-form.model';

@Component({
  selector: 'app-edit-profile-form',
  templateUrl: './edit-profile-form.component.html',
  styleUrls: ['./edit-profile-form.component.scss'],
  imports: [
    IonButton,
    DatePipe,
    ReactiveFormsModule,
    IonText,
    IonInput,
    IonTextarea,
    IonIcon
],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProfileFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  initialData = input.required<UserProfileFormData>();
  isSubmitting = input(false);
  formSubmit = output<UserProfileFormData>();
  formChanges = output<UserProfileFormData>();

  // URL pattern that accepts domains with or without protocol
  // Supports modern TLDs (2+ chars) and internationalized domains
  private readonly websitePattern =
    /^(https?:\/\/)?([\da-zA-Z.-]+)\.([a-zA-Z.]{2,})([/\w .-]*)*\/?$/;

  form = this.fb.nonNullable.group({
    displayName: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        Validators.pattern('^[a-zA-Z0-9_]+$'),
      ],
    ],
    bio: ['', [Validators.maxLength(500)]],
    website: [
      '',
      [Validators.maxLength(100), Validators.pattern(this.websitePattern)],
    ],
    birthDate: [''],
  });

  constructor() {
    addIcons({ calendarOutline });

    effect(() => {
      const data = this.initialData();
      this.form.patchValue(data, { emitEvent: false });
    });

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.formChanges.emit(value as UserProfileFormData);
      });
  }

  onSubmit() {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.getRawValue());
    } else {
      this.form.markAllAsTouched();
    }
  }

  isInvalid(
    controlName: keyof EditProfileFormComponent['form']['controls']
  ): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  /** Apply server validation errors to the appropriate form controls */
  applyServerErrors(error: unknown, facade: ProfileErrorFacade): void {
    handleInlineFormError({
      error,
      form: this.form,
      context: 'update-profile',
      facade,
      validationOptions: {
        controlNameByServerField: { email: 'username' },
      },
    });
  }

  /** Clear server validation errors before submitting */
  clearServerErrors(): void {
    clearServerFieldErrors(this.form);
  }
}
