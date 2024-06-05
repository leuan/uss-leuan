<script>
	import { fetchWithToken } from '$lib/fetchWithToken';
	import { onMount } from 'svelte';

	let answer = {};

	onMount(async () => {
		const res = await fetchWithToken('http://localhost:8080/api/v1/projects', {
			method: 'GET'
		});
		answer = await res.json();
	});
</script>

<h1>Welcome to SvelteKit</h1>

<p>
	{JSON.stringify(answer)} Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>
