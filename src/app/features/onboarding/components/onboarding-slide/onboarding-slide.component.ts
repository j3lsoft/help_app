import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonText } from '@ionic/angular/standalone';

@Component({
  selector: 'app-onboarding-slide',
  templateUrl: './onboarding-slide.component.html',
  styleUrls: ['./onboarding-slide.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonText],
})
export class OnboardingSlideComponent {
  imageSrc = input.required<string>();
  title = input.required<string>();
  description = input.required<string>();

  screenHeight = input(0);
}
