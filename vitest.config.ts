import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	// Le plugin SvelteKit fournit les alias ($lib…) : sans lui, les schémas qui importent
	// '$lib/schemas/fields' ne se chargent pas dans les tests
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.ts']
	}
});
