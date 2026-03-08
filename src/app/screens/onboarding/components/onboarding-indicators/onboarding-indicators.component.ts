import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
    selector: 'app-onboarding-indicators',
    templateUrl: './onboarding-indicators.component.html',
    styleUrls: ['./onboarding-indicators.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgFor],
})
export class OnboardingIndicatorsComponent {
  @Input() total = 0;
  @Input() currentIndex = 0;
}

