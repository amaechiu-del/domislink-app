import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const root = dirname(fileURLToPath(import.meta.url));
export default defineConfig({ build: { rollupOptions: { input: { main: resolve(root, 'index.html'), onelink: resolve(root, 'onelink.html') } } } });
