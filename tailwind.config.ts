import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				cloudflare: '#FF6633',
				'cloudflare-light': '#F8962E'
			},
			blur: {
				xs: '1px'
			}
		},
		fontFamily: {
			sans: ['Poppins', 'sans-serif']
		}
	},

	plugins: []
} satisfies Config;
