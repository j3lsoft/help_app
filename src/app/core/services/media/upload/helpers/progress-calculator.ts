import { UploadPhase } from '../models/upload-task.model';

export const PHASE_WEIGHTS: Record<UploadPhase, number> = {
  [UploadPhase.REQUEST_URL]: 0.05,
  [UploadPhase.UPLOAD]: 0.8,
  [UploadPhase.PROCESSING]: 0.1,
  [UploadPhase.CONFIRM]: 0.05,
};

const ORDERED_PHASES: UploadPhase[] = [
  UploadPhase.REQUEST_URL,
  UploadPhase.UPLOAD,
  UploadPhase.PROCESSING,
  UploadPhase.CONFIRM,
];

export class UploadProgressCalculator {
  /**
   * Calculates the total progress (0-100) based on the current phase
   * and how much of that phase is complete (0-1).
   */
  static calculate(phase: UploadPhase, completionRatio = 1): number {
    const baseProgress = this.getBaseProgress(phase);
    const phaseWeight = PHASE_WEIGHTS[phase];
    return Math.round((baseProgress + completionRatio * phaseWeight) * 100);
  }

  /**
   * Convenience method for the total progress at the end of a phase.
   */
  static getPhaseCompletionProgress(phase: UploadPhase): number {
    return this.calculate(phase, 1);
  }

  private static getBaseProgress(currentPhase: UploadPhase): number {
    let base = 0;
    for (const phaseName of ORDERED_PHASES) {
      if (phaseName === currentPhase) break;
      base += PHASE_WEIGHTS[phaseName];
    }
    return base;
  }
}
