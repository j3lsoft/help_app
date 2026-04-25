// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000',
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
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm'], // <== optional
    maxConcurrentUploads: 3,
    retryAttempts: 3,
    retryDelay: 1000,
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
