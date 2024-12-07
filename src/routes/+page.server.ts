import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.CF_API_KEY && locals.CF_ACCOUNT_ID) redirect(307, '/manager');
};

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const token = formData.get('token');
		const account = formData.get('account');

		if (!token || !account) return fail(400);

		if (typeof token === 'string') {
			cookies.set('cf_api_token', token, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30 // 30 days
			});
		}

		if (typeof account === 'string') {
			cookies.set('cf_account', account, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30 // 30 days
			});
		}

		return { success: true };
	}
} satisfies Actions;
