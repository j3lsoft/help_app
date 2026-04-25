import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ionic.SocialMedia',
  appName: 'ionic-SocialMedia',
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
      navigationBarColor: '#000000',
    },
  },
};

export default config;
