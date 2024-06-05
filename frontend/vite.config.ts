import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), purgeCss()],
	server: {
		proxy: {
			'/api': { target: 'http://localhost:8080', changeOrigin: true, rewrite: (path) => path.replace(/^\/5173/, '8080') },
		}
	}
});
