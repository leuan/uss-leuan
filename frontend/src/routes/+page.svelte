<script>
	import { fetchWithToken } from '$lib/fetchWithToken';
	import { onMount } from 'svelte';
	import MdiAdd from '~icons/mdi/add';
	import { goto } from '$app/navigation';

	let answer = {};
	let projects = [];

	onMount(async () => {
		const res = await fetchWithToken('http://localhost:8080/api/v1/projects', {
			method: 'GET'
		});
		projects = (await res.json()).results;
	});
</script>

<h1 class="h1 mx-7 mb-14 mt-7">
	<span
		class="from-error-500 to-primary-500 bg-gradient-to-br box-decoration-clone bg-clip-text text-transparent"
	>
		Projects.
	</span>
</h1>
{#if projects.length === 0}
	<div class="flex h-4/5 w-full flex-col items-center justify-center">
		<a href="/create" class="btn btn-icon variant-filled-primary mb-8"><MdiAdd /></a>
		<p class="text-surface-500 text-xl">There are no projects. Start by creating one.</p>
	</div>
{:else}
	{#each projects as project}
		<div
			tabindex="0"
			role="button"
			on:keydown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					goto(`/project?projectId=${project._id}`);
				}
			}}
			on:click={() => {
				goto(`/project?projectId=${project._id}`);
			}}
			class="card card-hover mx-5 my-3"
		>
			<section class="flex justify-between p-4">
				<p>
					{project.name}
				</p>
				<p class="mr-8">
					{new Date(project.createdAt).toLocaleDateString()}
				</p>
			</section>
		</div>
	{/each}
{/if}

<style lang="postcss">
</style>
