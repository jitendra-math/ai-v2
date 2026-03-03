// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      $lib: './src/lib',
      $components: './src/lib/components',
      $utils: './src/lib/utils',
      $stores: './src/lib/stores',
      $config: './src/lib/config'
    }
  }
};

export default config;