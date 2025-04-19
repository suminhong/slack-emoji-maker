import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    port: 8080,
    host: true,
    allowedHosts: true,
    strictPort: true,
    cors: true
  },
  plugins: [
    react(),
    {
      name: 'health-check',
      enforce: 'pre',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.originalUrl === '/api/ping') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
            return;
          }
          next();
        });
      }
    }
  ]
})
