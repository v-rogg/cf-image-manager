<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import Footer from '$lib/Footer.svelte';
	let token = $state('');
	let account = $state('');
</script>

<div class="w-100 flex h-[100dvh] items-center justify-center">
	<div class="rounded-lg border border-gray-300 bg-gray-100 pt-6 drop-shadow-xl">
		<div class="ml-8 items-center gap-2 pb-4">
			<img src="/favicon.png" alt="Cloudflare Images Manager" class="mb-3 w-12" />
			<h1 class="text-2xl font-medium">
				Cloudflare Images<i class="fa-sharp fa-regular fa-trademark -translate-y-2 text-xs"></i> Manager
			</h1>
		</div>
		<form
			method="POST"
			class="item flex flex-col gap-4 rounded-b-md bg-white p-8"
			action="?/open"
			use:enhance={() => {
				invalidateAll();
			}}
		>
			<div class="flex flex-col">
				<label for="account-input" class="ml-2">Account ID</label>
				<input
					id="account-input"
					name="account"
					bind:value={account}
					class="min-w-[40ch] border-[1px] border-black"
					placeholder="Input your Cloudflare Account ID here"
				/>
			</div>
			<div class="flex flex-col">
				<label for="token-input" class="ml-2">API Token</label>
				<input
					id="token-input"
					name="token"
					bind:value={token}
					class="min-w-[40ch] border-[1px] border-black"
					placeholder="Input your Cloudflare Token here"
				/>
			</div>
			{#if token.length === 40 && account.length === 32}
				<button
					type="submit"
					disabled={token.length !== 40 || account.length !== 32}
					class="mx-auto mt-4 w-fit rounded bg-cloudflare px-4 py-2 text-white disabled:bg-gray-400"
					>Open manager</button
				>
			{/if}
			<Footer />
		</form>
	</div>
</div>

<style lang="postcss">
	input {
		@apply rounded border-gray-400 px-2 py-1 placeholder:text-gray-300;
	}
</style>
