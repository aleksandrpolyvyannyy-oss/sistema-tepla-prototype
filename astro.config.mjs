// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Прототип: адрес сайта — заглушка, заменить на боевой домен перед запуском.
export default defineConfig({
  site: 'https://sistema-tepla.ru',
  // Для показа на GitHub Pages сайт живёт в подпапке: BASE_PATH=/sistema-tepla-prototype
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  build: { format: 'directory' },
  server: { port: 4321, host: true },
  devToolbar: { enabled: false },
  integrations: [
    sitemap({
      filter: (page) => !/\/(spasibo|karta-prototipa|404)\/?$/.test(page),
    }),
  ],
});
