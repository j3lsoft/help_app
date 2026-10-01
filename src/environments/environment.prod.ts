export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:3000',
  minAgeYears: 13,
  upload: {
    limits: {
      avatar: {
        maxBytes: 10 * 1024 * 1024,
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
        ],
      },
      post_image: {
        maxBytes: 2 * 1024 * 1024,
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
        ],
      },
      post_video: {
        maxBytes: 10 * 1024 * 1024,
        allowedMimeTypes: ['video/mp4', 'video/webm'],
      },
      story: {
        maxBytes: 10 * 1024 * 1024,
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'video/mp4',
          'video/webm',
        ],
      },
      generic: {
        maxBytes: 10 * 1024 * 1024,
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'video/mp4',
          'video/webm',
        ],
      },
    },
    retryAttempts: 3,
    retryDelay: 1000,
  },
};
