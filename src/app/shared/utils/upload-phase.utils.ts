import { UploadPhase } from '@core/services/media/upload/models';

export const PHASE_LABELS: Record<UploadPhase, string> = {
  [UploadPhase.REQUEST_URL]: 'Getting URL',
  [UploadPhase.UPLOAD]: 'Uploading',
  [UploadPhase.PROCESSING]: 'Processing',
  [UploadPhase.CONFIRM]: 'Confirming',
};
