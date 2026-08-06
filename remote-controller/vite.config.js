import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3001,
    strictPort: true,
    hmr: {
      clientPort: 443, // Use HTTPS port for ngrok
      protocol: 'wss', // WebSocket over TLS for HMR
    },
    allowedHosts: [
      'b4eb-103-105-178-99.ngrok-free.app',
      'localhost',
      '192.168.0.9',
      '.ngrok-free.app', // Allow all ngrok free domains
    ],
  },
  preview: {
    host: '0.0.0.0',
    port: 3001,
    strictPort: true,
  },
});
