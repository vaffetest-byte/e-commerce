
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Vite does not automatically polyfill 'process.env' for the browser.
    // Standard library usage like the Gemini API requires this definition.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env': {}
  },
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
});
