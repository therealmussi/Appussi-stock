import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base relativo: l'app funziona anche da sottocartella di GitHub Pages
// (https://therealmussi.github.io/Appussi-stock/copero-nba/app/)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: {
    outDir: 'app',
    emptyOutDir: true,
  },
});
