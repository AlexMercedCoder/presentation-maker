import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-vendor': ['jspdf', 'html2canvas'],
          'qr-vendor': ['qrcode']
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
});
