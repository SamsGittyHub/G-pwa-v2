import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.tripleg.genius',
  appName: 'TripleG Genius',
  webDir: 'dist',
  // Comment out server.url to use local build for production
  // Uncomment for development with hot-reload
  // server: {
  //   url: 'https://your-railway-app.railway.app',
  //   cleartext: true
  // },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    backgroundColor: '#1a1a2e'
  }
};

export default config;
