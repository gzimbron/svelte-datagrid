import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess({})],

	kit: {
		adapter: adapter(),
		paths: {
			// eslint-disable-next-line turbo/no-undeclared-env-vars
			base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
		},
		alias: {
			$siteconfig: './src/siteconfig.ts',
			'$sitecomponent/*': './src/lib/sitecomponents/*'
		}
	}
};

export default config;
