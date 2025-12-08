import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // @ts-ignore: Fix property 'cwd' does not exist on type 'Process'
  const currentDir = process.cwd();
  const env = loadEnv(mode, currentDir, '');

  return {
    base: './',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(currentDir, './'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1600,
    },
    define: {
      // Safely replace process.env.API_KEY with the string value of the key
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});