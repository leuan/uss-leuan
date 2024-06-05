<script>
	import { user, initKeycloak } from '$lib/auth';
	import { onMount } from 'svelte';

	let userProfile;
	let isLoading = true;
	let keycloak;

	onMount(async () => {
		await initKeycloak();
		isLoading = false;
	});

	user.subscribe((value) => {
		userProfile = value;
	});

	user.subscribe((value) => {
		keycloak = value;
	});

	async function handleLogout() {
		if (keycloak) {
			try {
				await keycloak.logout();
			} catch (err) {
				console.error('Logout failed', err);
			}
		} else {
			console.error('Keycloak instance is not available');
		}
	}
</script>

<main>
	{#if isLoading}
		<p>Loading...</p>
	{:else if userProfile}
		<p>Welcome, {userProfile.username}</p>
		<button on:click={handleLogout}>Logout</button>
        <slot></slot>
	{/if}
</main>
