<script>
	import { fetchWithToken } from '$lib/fetchWithToken';
	import { onMount } from 'svelte';
	import MdiAdd from '~icons/mdi/add';
	import MdiSearch from '~icons/mdi/search';
	import { goto } from '$app/navigation';
	import { Paginator } from '@skeletonlabs/skeleton';

	let projects = [];

	let paginationSettings = {
		page: 0,
		limit: 5,
		size: 0,
		amounts: [1, 2, 5, 10]
	};

	let query = '';

	const fetchProjects = async (page = 0, limit = 5) => {
		const params = new URLSearchParams({
			page: (page + 1).toString(),
			limit: limit.toString(),
			name: query
		});

		const res = await fetchWithToken(`http://localhost:8080/api/v1/projects?${params.toString()}`, {
			method: 'GET'
		});
		const response = await res.json();
		projects = response.results;

		paginationSettings = {
			page: paginationSettings.page,
			limit: paginationSettings.limit,
			size: response.total,
			amounts: [1, 2, 5, 10]
		};
	};
	onMount(fetchProjects);

	const onPageChange = () => {
		fetchProjects(paginationSettings.page, paginationSettings.limit);
	};

	const onAmountChange = () => {
		fetchProjects(paginationSettings.page, paginationSettings.limit);
	};
</script>

<div class="flex items-center justify-between">
	<h1 class="h1 mx-7 mb-14 mt-7">
		<span
			class="from-error-500 to-primary-500 bg-gradient-to-br box-decoration-clone bg-clip-text text-transparent"
		>
			Projects.
		</span>
	</h1>
	{#if paginationSettings.size > 0}
		<a href="/create" class="btn btn-icon variant-filled-primary mr-8"><MdiAdd /></a>
	{/if}
</div>
{#if paginationSettings.size === 0}
	<div class="flex h-4/5 w-full flex-col items-center justify-center">
		<a href="/create" class="btn btn-icon variant-filled-primary mb-8"><MdiAdd /></a>
		<p class="text-surface-500 text-xl">There are no projects. Start by creating one.</p>
	</div>
{:else}
	<div class="flex flex-col items-center">
		<div class="input-group input-group-divider my-3 max-w-screen-md grid-cols-[auto_1fr_auto]">
			<div class="input-group-shim"><MdiSearch /></div>
			<input
				type="search"
				on:keydown={() => {
					(event) => {
						if (event.key === 'Enter') {
							fetchProjects(paginationSettings.page, paginationSettings.limit);
						}
					};
				}}
				bind:value={query}
				placeholder="Search..."
			/>
			<button
				class="variant-filled-secondary"
				on:click={() => {
					fetchProjects(paginationSettings.page, paginationSettings.limit);
				}}
			>
				Submit
			</button>
		</div>
	</div>
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

	<Paginator
		class="mx-5 my-3"
		on:page={onPageChange}
		on:amount={onAmountChange}
		bind:settings={paginationSettings}
		showFirstLastButtons={false}
		showPreviousNextButtons={true}
	/>
{/if}

<style lang="postcss">
</style>
