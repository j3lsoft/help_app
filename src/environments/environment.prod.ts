export const environment = {
  production: true,
  apiBaseUrl: '',
  minAgeYears: 13,
  upload: {
    // Driver de subida: 'presigned' (recomendado) o 'direct'
    strategy: 'presigned',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
    ],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm'],
    maxConcurrentUploads: 3,
    retryAttempts: 3,
    retryDelay: 1000,

    // Compression logic is not yet implemented
    compression: {
      enabled: true,
      rules: {
        avatar: { maxSizeMB: 0.3, maxWidthOrHeight: 512 },
        post_image: { maxSizeMB: 1, maxWidthOrHeight: 1920 },
        post_video: null,
        story: { maxSizeMB: 0.8, maxWidthOrHeight: 1080 },
      },
    },
  },
};
