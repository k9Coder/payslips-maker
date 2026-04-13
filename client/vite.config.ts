import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

const isDemoMode = process.env.VITE_DEMO_MODE === 'true';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/payslips-maker/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@payslips-maker/shared': path.resolve(__dirname, '../shared/src/index.ts'),
      ...(isDemoMode
        ? { '@clerk/clerk-react': path.resolve(__dirname, './src/demo/clerk-mock.ts') }
        : {}),
    },
  },
  build: {
    sourcemap: true,
  },
  esbuild: {
    sourcesContent: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
