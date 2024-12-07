import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const cf_api_token = event.cookies.get('cf_api_token');
	const cf_account = event.cookies.get('cf_account');
	if (cf_api_token) event.locals.CF_API_KEY = cf_api_token;
	if (cf_account) event.locals.CF_ACCOUNT_ID = cf_account;

	return await resolve(event);
};
