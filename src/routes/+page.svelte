<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	let token = $state('');
</script>

<div class="w-100 flex h-[100dvh] items-center justify-center">
	<form
		method="POST"
		class="flex flex-col gap-2"
		use:enhance={() => {
			invalidateAll();
		}}
	>
		<label for="account-input">Input your Cloudflare Account ID here</label>
		<input id="account-input" name="account" class="min-w-[40ch] border-[1px] border-black" />
		<label for="token-input">Input your Cloudflare Token here</label>
		<input
			id="token-input"
			name="token"
			bind:value={token}
			class="min-w-[40ch] border-[1px] border-black"
		/>
		<button
			type="submit"
			disabled={token.length !== 40}
			class="mt-8 rounded bg-gray-600 px-2 py-1 text-white disabled:bg-gray-400"
			>Open manager</button
		>
	</form>
</div>
