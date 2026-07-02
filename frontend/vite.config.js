import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'print-urls',
      configureServer(server) {
        server.httpServer?.once('listening', () => {
          const addr = server.httpServer.address();
          const port = typeof addr === 'object' ? addr?.port : 5173;
          const base = `http://localhost:${port}`;
          const reset = '\x1b[0m';
          const bold  = '\x1b[1m';
          const cyan  = '\x1b[36m';
          const green = '\x1b[32m';
          const blue  = '\x1b[34m';
          console.log('');
          console.log(`  ${bold}${green}✦ Acowale CRM — App URLs${reset}`);
          console.log(`  ${cyan}[>] Feedback Form  ${reset}${bold}${blue}${base}/feedback${reset}`);
          console.log(`  ${cyan}[*] Admin Login    ${reset}${bold}${blue}${base}/admin/login${reset}`);
          console.log('');
        });
      },
    },
  ],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
});
