import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const { DIR, PORT = '8080' } = process.env;

export default defineConfig(() => {
  if (!DIR) {
    throw new Error('DIR environment variable is required');
  }
  return {
    root: resolve('examples', DIR),
    server: { port: Number(PORT) },
    resolve: {
      alias: {
        'jotai-location': resolve(__dirname, './src'),
      },
    },
  };
});
