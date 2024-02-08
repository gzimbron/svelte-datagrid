/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				base: '#FDFFFC',
				primary: '#c1292e',
				secondary: '#235789'
			}
		}
	},

	plugins: []
};

module.exports = config;
