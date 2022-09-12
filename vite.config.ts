// vite.config.js

import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
	base: '/interactive-card-details-form/',
	build: {
		rollupOptions: {
			output: {
				assetFileNames: 'style.css',
				entryFileNames: 'main.js',
			},
		},
	},
})