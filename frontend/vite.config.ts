import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import type { Plugin, ViteDevServer, PreviewServer } from 'vite'

// Custom plugin to handle /admin route in development
function adminRoutePlugin(): Plugin {
  return {
    name: 'admin-route-plugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req: any, _res: any, next: any) => {
        // Only redirect the base /admin path, let React Router handle sub-routes
        if (req.url === '/admin') {
          req.url = '/admin.html';
        }
        next();
      });
    },
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use((req: any, _res: any, next: any) => {
        // Only redirect the base /admin path, let React Router handle sub-routes
        if (req.url === '/admin') {
          req.url = '/admin.html';
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), adminRoutePlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 5173,
  },
})
