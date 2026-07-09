import { readFileSync } from 'fs';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	define: {
		'import.meta.env.VITE_APP_VERSION': JSON.stringify(
			process.env.VITE_APP_VERSION ?? pkg.version
		),
		'import.meta.env.VITE_ATTESTATION_URL': JSON.stringify(
			process.env.VITE_ATTESTATION_URL ?? ''
		)
	}
});
