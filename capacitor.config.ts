import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.isk.chatroom',
  appName: 'ISK Chat Room',
  webDir: 'dist',
   server: {
    androidScheme: 'https'
  }
};

export default config;
