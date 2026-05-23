/// <reference types="@capacitor/splash-screen" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.help.SocialMedia',
  appName: 'Help',
  webDir: 'www/browser',
  plugins: {
    SystemBars: {
      insetsHandling: 'disable',
    },
    Keyboard: {
      resizeOnFullScreen: false,
    },
    EdgeToEdge: {
      statusBarColor: '#0683a0',
    },
    SplashScreen: {
      launchAutoHide: false,
      showSpinner: false,
      backgroundColor: '#041331',
      launchFadeOutDuration: 300,
    },
  },
};

export default config;
