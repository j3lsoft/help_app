import {
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
} from '@angular/core';

@Component({
  selector: 'app-onboarding-indicators',
  templateUrl: './onboarding-indicators.component.html',
  styleUrls: ['./onboarding-indicators.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class OnboardingIndicatorsComponent {
  total = input(0);
  currentIndex = input(0);

  dots = computed(() => Array(this.total()).fill(0));
}
