import { fail, type Actions } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

async function getImages(account: string, key: string) {
	return await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/images/v2`, {
		headers: {
			Authorization: `Bearer ${key}`
		}
	})
		.then((res) => res.json())
		.then(
			(res) =>
				<[{ id: string; filename: string; variants: string[]; uploaded: string }]>res.result.images
		);
}

async function getStats(account: string, key: string) {
	return await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/images/v1/stats`, {
		headers: {
			Authorization: `Bearer ${key}`
		}
	})
		.then((res) => res.json())
		.then((res) => <{ allowed: number; current: number }>res.result.count);
}

async function deleteImage(account: string, key: string, image_id: string) {
	return await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${account}/images/v1/${image_id}`,
		{
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${key}`
			}
		}
	).then((res) => res.json());
}

async function uploadImage(account: string, key: string, form: FormData) {
	return await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/images/v1	`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${key}`
		},
		body: form
	});
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.CF_API_KEY || !locals.CF_ACCOUNT_ID) redirect(307, '/');

	const images = await getImages(locals.CF_ACCOUNT_ID, locals.CF_API_KEY);
	const stats = await getStats(locals.CF_ACCOUNT_ID, locals.CF_API_KEY);

	let account_hash = '';
	if (images.length > 0 && images[0].variants.length > 0) {
		account_hash = images[0].variants[0].split('https://imagedelivery.net/')[1].split('/')[0];
	}

	return { base_url: `https://imagedelivery.net/${account_hash}/`, images, stats };
};

export const actions = {
	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const selection: string[] = JSON.parse(formData.get('selection')?.toString() || '[]');

		if (selection.length <= 0 || !locals.CF_ACCOUNT_ID || !locals.CF_API_KEY) return fail(400);

		const promises = selection.map(async (e) => {
			await deleteImage(<string>locals.CF_ACCOUNT_ID, <string>locals.CF_API_KEY, e);
		});
		await Promise.all(promises);

		return { success: true, images: await getImages(locals.CF_ACCOUNT_ID, locals.CF_API_KEY) };
	},
	upload: async ({ request, locals }) => {
		const formData = await request.formData();

		if (!locals.CF_ACCOUNT_ID || !locals.CF_API_KEY) return fail(400);

		await uploadImage(locals.CF_ACCOUNT_ID, locals.CF_API_KEY, formData);

		return {
			success: true,
			images: JSON.stringify(await getImages(locals.CF_ACCOUNT_ID, locals.CF_API_KEY))
		};
	}
} satisfies Actions;
