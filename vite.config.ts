
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env.SUPABASE_URL': JSON.stringify('https://laudxusnxpulctxwbjtq.supabase.co'),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdWR4dXNueHB1bGN0eHdianRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNjI3MjYsImV4cCI6MjA4MjkzODcyNn0.UPmNRGQ8BUm4rQsSZ2eNVyJ8aZlS3iE6fA7_cuC26a0'),
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
