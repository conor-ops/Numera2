import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';
import { APP_CONFIG } from './config';

const config: CapacitorConfig = {
  appId: APP_CONFIG.branding.packageId,
  appName: APP_CONFIG.branding.name,
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      overlaysWebView: false,
      backgroundColor: '#FFFFFFFF' // Opaque White (Hex with Alpha)
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      style: KeyboardStyle.Dark,
      resizeOnFullScreen: true
    }
  }
};

export default config;