import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Build statica committata in ../dream-lnh/ e servita da GitHub Pages
// (https://therealmussi.github.io/Appussi-stock/dream-lnh/),
// stessa convenzione di sport-shot-challenge/.
// base relativo: funziona anche da sottocartella.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: {
    outDir: '../dream-lnh',
    emptyOutDir: true,
  },
});
