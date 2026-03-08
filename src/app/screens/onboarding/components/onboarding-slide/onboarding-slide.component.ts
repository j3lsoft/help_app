import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-onboarding-slide',
    templateUrl: './onboarding-slide.component.html',
    styleUrls: ['./onboarding-slide.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IonicModule],
})
export class OnboardingSlideComponent {
  @Input() imageSrc!: string;
  @Input() title!: string;
  @Input() description!: string;

  @Input() screenHeight = 0;
}

