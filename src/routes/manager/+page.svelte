<script lang="ts">
	import { type PageData } from './$types';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import toast, { Toaster } from 'svelte-hot-french-toast';
	import Exit from '$lib/Exit.svelte';
	import Footer from '$lib/Footer.svelte';

	let { data }: { data: PageData } = $props();
	let images = $state(data.images);
	let selection = $state(new Map());

	onMount(() => {
		selection = new Map(images.map((image) => [image.id, false]));
	});

	let selection_size = $derived([...selection.values()].filter(Boolean).length);

	function toggleSelection(id: string) {
		selection.set(id, !selection.get(id));
		selection = new Map(selection);
	}

	let in_progress = $state(false);

	const locales = navigator?.languages || 'en';
	const date_locale = locales.find((l) => /^de-de$/i.test(l)) ? 'de' : locales[0];
</script>

{#if in_progress}
	<div class="fixed inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
		<div class="rounded-lg bg-white p-8 text-black">Working for you</div>
	</div>
{/if}

<Toaster />

<main class="container mx-auto pt-8">
	<header class="mb-4 mt-8 flex items-center justify-between border-b-2">
		<div class="flex items-center gap-4">
			<div>
				<img src="/favicon.png" alt="Cloudflare Images Manager" class="w-20" />
			</div>
			<div>
				<h1 class="text-2xl font-medium">Cloudflare Image Manager</h1>
				<p>
					<span class="pr-10">
						{data.base_url}
					</span>
					<span>
						<span class="font-semibold"
							>{data.stats.current.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span
						>
						of {data.stats.allowed.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
					</span>
				</p>
			</div>
		</div>
		<Exit />
	</header>

	<form
		method="POST"
		use:enhance={({ formData }) => {
			const res = confirm(`Are you sure you want to delete the ${selection_size} selected images?`);
			if (!res) return;
			in_progress = true;

			formData.set(
				'selection',
				JSON.stringify(
					Array.from(selection)
						.filter((e) => e[1])
						.map(([key]) => key)
				)
			);

			return async ({ result }) => {
				if (result.status == 200) {
					// @ts-expect-error result is not strongly typed
					images = result.data?.images;
					selection = new Map(images.map((image) => [image.id, false]));
				}
				in_progress = false;
				await invalidateAll();
			};
		}}
	>
		<div class="mb-6 flex items-center justify-between">
			<div class="text-lg">
				<span class="font-semibold">{selection_size}</span> Selected<span class="ml-2 text-sm"
					>(Select using Ctrl + Click)</span
				>
			</div>
			<div>
				<button
					class="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 active:bg-red-900 disabled:bg-gray-300"
					disabled={selection_size <= 0}
					tabindex="0"
					type="submit"
					formaction="?/delete"
					>Delete<i class="fa-sharp fa-regular fa-trash-xmark ml-2"></i></button
				>
			</div>
		</div>

		<div class="grid grid-cols-8 gap-2">
			{#each images as image}
				{@const date = new Date(image.uploaded)}
				<button
					id={image.id}
					onclick={(e) => {
						e.preventDefault();
						if (e.metaKey || e.ctrlKey) {
							toggleSelection(image.id);
						} else {
							navigator.clipboard.writeText(data.base_url + image.id);
							toast.success('Copied to clipboard', { position: 'bottom-end' });
						}
					}}
					class="bloc k h-max overflow-hidden rounded border pt-2 shadow-lg transition"
					tabindex="0"
					title={image.id}
					class:selected={selection.get(image.id)}
					class:not-selected={selection_size > 0 && !selection.get(image.id)}
				>
					<div class="index text-wrap break-words border-b px-2 pb-2 text-sm leading-tight">
						<div class="h-5 overflow-hidden text-ellipsis text-nowrap">
							{image.filename}
						</div>
						<div class="mt-1 text-xs">
							{date.toLocaleDateString(date_locale)}
							{date.toLocaleTimeString(date_locale)}
						</div>
					</div>
					<div class="bg-white">
						<div class="pattern-checks">
							<img src={data.base_url + image.id + '/w=200'} alt="" class="" />
						</div>
					</div>
				</button>
			{/each}
		</div>
	</form>
	<Footer />
</main>

<style lang="postcss">
	.selected {
		@apply border-current;
		@apply text-blue-500;
		@apply font-medium;
		@apply shadow-xl;
	}

	.not-selected {
		@apply opacity-50;
		@apply blur-xs;
	}

	.pattern-checks {
		@apply text-gray-200;
		background-image: repeating-linear-gradient(
				45deg,
				currentColor 25%,
				transparent 25%,
				transparent 75%,
				currentColor 75%,
				currentColor
			),
			repeating-linear-gradient(
				45deg,
				currentColor 25%,
				transparent 25%,
				transparent 75%,
				currentColor 75%,
				currentColor
			);
		background-position:
			0 0,
			10px 10px;
		background-size: calc(2 * 10px) calc(2 * 10px);
	}
</style>
