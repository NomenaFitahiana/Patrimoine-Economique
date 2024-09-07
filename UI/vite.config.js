// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import legacy from "@vitejs/plugin-legacy"

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react(), legacy],
// })
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), legacy()],
  build: {
    chunkSizeWarningLimit: 1000, // Exemple: 1000 Ko
  },
});

