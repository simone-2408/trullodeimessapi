import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  base: process.env.VITE_BASE_PATH || '/trullodeimessapi/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    open: false,
  },
  build: {
    copyPublicDir: !isSsrBuild,
    rollupOptions: {
      output: {
        manualChunks: isSsrBuild ? undefined : {
          three: ['three'],
          vendor: ['react', 'react-dom', 'lucide-react'],
        },
      },
    },
  },
}));
