<script>
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
</script>

<form
	method="POST"
	action="/?/exit"
	use:enhance={() => {
		return async () => {
			await invalidateAll();
		};
	}}
>
	<button type="submit" class="rounded px-4 py-2 transition hover:bg-gray-100 active:bg-gray-300">
		Exit <i class="fa-sharp fa-regular fa-circle-xmark ml-1"></i></button
	>
</form>
