import { UploadPhase } from '../models/upload-task.model';
import { UploadProgressCalculator } from './progress-calculator';

describe('UploadProgressCalculator', () => {
  it('should calculate initial completion progress correctly (Request URL)', () => {
    const progress = UploadProgressCalculator.getPhaseCompletionProgress(
      UploadPhase.REQUEST_URL
    );
    expect(progress).toBe(5);
  });

  it('should calculate upload completion progress correctly (100% upload phase)', () => {
    const progress = UploadProgressCalculator.getPhaseCompletionProgress(
      UploadPhase.UPLOAD
    );
    expect(progress).toBe(85); // 5 (req) + 80 (upload)
  });

  it('should calculate processing completion progress correctly', () => {
    const progress = UploadProgressCalculator.getPhaseCompletionProgress(
      UploadPhase.PROCESSING
    );
    expect(progress).toBe(95); // 85 + 10
  });

  it('should calculate final completion progress correctly', () => {
    const progress = UploadProgressCalculator.getPhaseCompletionProgress(
      UploadPhase.CONFIRM
    );
    expect(progress).toBe(100);
  });

  it('should calculate upload phase progress mid-way', () => {
    // 50% through UPLOAD phase
    // Total = Base (5) + (50% of 80) = 5 + 40 = 45
    const progress = UploadProgressCalculator.calculate(
      UploadPhase.UPLOAD,
      0.5
    );
    expect(progress).toBe(45);
  });

  it('should calculate phase progress genericly', () => {
    // 50% through PROCESSING phase
    // Base (85) + (50% of 10) = 85 + 5 = 90
    const progress = UploadProgressCalculator.calculate(
      UploadPhase.PROCESSING,
      0.5
    );
    expect(progress).toBe(90);
  });
});
