import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type UploadRingStatus = 'idle' | 'baking' | 'uploading' | 'creating' | 'done' | 'failed';

/**
 * Calm-darkroom circular progress: one ring per file, showing its own life.
 * Baking (amber pulse) → uploading (cyan sweep + %) → creating (cyan spin) → done (green check).
 */
@Component({
  selector: 'app-upload-ring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-ring.component.html',
  styleUrls: ['./upload-ring.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadRingComponent {
  readonly progress = input<number>(0);
  readonly status = input<UploadRingStatus>('uploading');
  readonly label = input<string>('');

  /**
   * Normalized path length (`pathLength` on the SVG circle). The dash array and
   * offset are expressed in these units, so the rendered arc is exactly
   * `clamped()` percent of the ring regardless of the circle's radius/geometry.
   */
  protected readonly ringPathLength = 100;

  readonly clamped = computed(() => Math.max(0, Math.min(100, Math.round(this.progress()))));
  readonly dashOffset = computed(() => this.ringPathLength - this.clamped());

  readonly ariaText = computed(() => {
    const s = this.status();
    if (s === 'done') return 'Upload complete';
    if (s === 'failed') return 'Upload failed';
    if (s === 'baking') return `Processing ${this.clamped()} percent`;
    if (s === 'creating') return 'Creating post';
    return `Uploading ${this.clamped()} percent`;
  });
}
