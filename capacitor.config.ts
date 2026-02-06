import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'fr.vard.app',
  appName: 'VARD',
  webDir: 'public', // Placeholder for dev mode (Live Reload takes precedence)
  server: {
    url: 'http://10.220.219.231:3000', // YOUR LOCAL IP
    cleartext: true
  }
};

export default config;
