import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  // The React Router plugin provides React fast-refresh + SSR build,
  // so the standalone @vitejs/plugin-react is no longer needed.
  plugins: [reactRouter()],
  base: './',
});
