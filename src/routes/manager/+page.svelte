<script lang="ts">
	import { type PageData } from './$types';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';

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
</script>

{#if in_progress}
	<div class="fixed inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
		<div class="rounded-lg bg-white p-8 text-black">Working for you</div>
	</div>
{/if}

<main class="container mx-auto pt-8">
	<header class="mb-4 mt-8 flex items-center justify-between border-b-2">
		<h1 class="text-2xl">Cloudflare Image Manager</h1>
		<p>
			<span class="pr-10">
				{data.base_url}
			</span>
			<span>
				<b>{data.stats.current.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</b> of {data.stats.allowed
					.toString()
					.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
			</span>
		</p>
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
				<b>{selection_size}</b> Selected
			</div>
			<div>
				<button
					class="rounded-lg bg-red-600 px-3 py-1 text-white disabled:bg-gray-300"
					disabled={selection_size <= 0}
					tabindex="0"
					type="submit">Delete</button
				>
			</div>
		</div>

		<div class="grid grid-cols-8 gap-2">
			{#each images as image, i}
				<button
					id={i + image.id}
					onclick={(e) => {
						e.preventDefault();
						toggleSelection(image.id);
					}}
					class="bloc k h-max overflow-hidden rounded border-2 pt-2"
					tabindex="0"
					class:selected={selection.get(image.id)}
				>
					<div class="index h-32 text-wrap break-words px-2 leading-tight">
						{image.id}
						<br />
						<br />
						<span class="text-wrap break-words text-sm leading-tight">
							{image.filename}
						</span>
					</div>
					<img src={data.base_url + image.id + '/w=181'} alt="" class="pt-4" />
				</button>
			{/each}
		</div>
	</form>
</main>

<style lang="postcss">
	.selected {
		@apply bg-red-600;
		@apply border-red-950;
		@apply text-white;

		> .index {
		}
	}
</style>
