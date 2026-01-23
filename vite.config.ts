
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

// Charge les variables d'environnement depuis .env.local
dotenv.config({ path: '.env.local' });

export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill de process.env pour le navigateur
    'process.env': process.env
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  server: {
    host: true, // Écoute sur 0.0.0.0
    port: 3000
  },
  preview: {
    host: true, // Indispensable pour Cloud Run (0.0.0.0)
    port: parseInt(process.env.PORT || '8080'), // Port dynamique injecté par Cloud Run
    allowedHosts: true
  }
});
