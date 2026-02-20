import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'fr.vard.app',
  appName: 'VARD',
  webDir: 'public',
  android: {
    allowMixedContent: true,
  },
  server: {
    url: 'http://10.220.219.231:3000',
    cleartext: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
