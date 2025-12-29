import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: 'localhost',
        strictPort: false,
        hmr: {
          protocol: 'ws',
          host: 'localhost',
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
<<<<<<< HEAD
          '@/components': path.resolve(__dirname, './src/components'),
          '@/services': path.resolve(__dirname, './src/services'),
          '@/utils': path.resolve(__dirname, './src/utils'),
          '@/hooks': path.resolve(__dirname, './src/hooks'),
          '@/types': path.resolve(__dirname, './src/types'),
          '@/config': path.resolve(__dirname, './src/config'),
          '@/styles': path.resolve(__dirname, './src/styles'),
=======
>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a
        }
      },
      build: {
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: process.env.NODE_ENV === 'production',
            drop_debugger: true
          }
        }
      }
    };
});
