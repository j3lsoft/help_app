import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonInput,
  IonText,
  IonTextarea,
} from '@ionic/angular/standalone';
import { UserProfileFormData } from '../../models/profile-form.model';

@Component({
  selector: 'app-edit-profile-form',
  templateUrl: './edit-profile-form.component.html',
  styleUrls: ['./edit-profile-form.component.scss'],
  imports: [ReactiveFormsModule, IonText, IonInput, IonTextarea, IonButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProfileFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  initialData = input.required<UserProfileFormData>();
  isSubmitting = input(false);
  formSubmit = output<UserProfileFormData>();
  formChanges = output<UserProfileFormData>();

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
    birthDate: [''],
  });

  constructor() {
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

  // Computed max date for birthDate picker (memoized)
  maxDate = computed(() => new Date().toISOString().split('T')[0]);
}
