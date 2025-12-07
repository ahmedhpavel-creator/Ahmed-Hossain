import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/',
    plugins: [react()],
    define: {
      // Safely replace process.env.API_KEY with the string value of the key
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});