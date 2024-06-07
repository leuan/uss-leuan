<script>
	import ScaScan from './../../lib/components/ScaScan.svelte';
	import SastScan from './../../lib/components/SastScan.svelte';
	import MdiLink from '~icons/mdi/link';
	import MdiEdit from '~icons/mdi/edit';
	import MdiCode from '~icons/mdi/code';
	import MdiLayersSearchOutline from '~icons/mdi/layers-search-outline';
	import MdiWeb from '~icons/mdi/web';
	import { page } from '$app/stores';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import IastScan from '$lib/components/IastScan.svelte';
	import { fetchWithToken } from '$lib/fetchWithToken';
	import { onMount } from 'svelte';
	import { AppRail, AppRailTile, AppRailAnchor } from '@skeletonlabs/skeleton';
	const queryparams = $page.url.searchParams;
	const projectId = queryparams.get('projectId');

	let loading = true;
	let project = {};
	let currentTile = 0;

	const fetchProject = async () => {
		const res = await fetchWithToken(`/api/v1/projects/${projectId}`);
		if (!res.ok) {
			//redirect to 404
			return;
		}
		project = (await res.json()).result;
		loading = false;
	};

	onMount(fetchProject);
</script>

<div>
	<Breadcrumb customName={project?.name} />
	<!-- <p>{JSON.stringify(project)}</p> -->
	<div class="mx-7 mb-1 mt-3 flex items-center gap-4">
		<h1 class="h1">
			<span
				class="from-secondary-500 to-warning-500 text-ellipsis bg-gradient-to-br box-decoration-clone bg-clip-text capitalize text-transparent"
			>
				{project.name}
			</span>
		</h1>
		<button class="btn btn-icon variant-filled-secondary"><MdiEdit /></button>
		<a class="btn btn-icon variant-filled-warning" href={project.zapUrl}><MdiLink /></a>
	</div>
	<div class="text-surface-400 ml-8 flex items-center gap-2">
		<p>URL: {project.zapUrl}</p>
		<p>-</p>
		<p>Created at {new Date(project.createdAt).toLocaleDateString()}</p>
	</div>
	<div class="ml-7"></div>
</div>

<div class="card mx-7 my-3 flex h-fit overflow-hidden">
	<AppRail height="h-full">
		<AppRailTile bind:group={currentTile} name="tile-1" value={0} title="tile-1">
			<div class="flex justify-center">
				<MdiCode class="text-3xl" />
			</div>
			<span>Code</span>
		</AppRailTile>
		<AppRailTile bind:group={currentTile} name="tile-2" value={1} title="tile-2">
			<div class="flex justify-center">
				<MdiWeb class="text-3xl" />
			</div>
			<span>Web</span>
		</AppRailTile>
		<AppRailTile bind:group={currentTile} name="tile-3" value={2} title="tile-3">
			<svelte:fragment slot="lead">
				<div class="flex justify-center">
					<MdiLayersSearchOutline class="text-3xl" />
				</div>
			</svelte:fragment>
			<span>Composition</span>
		</AppRailTile>
	</AppRail>

	<div class="">
		{#if currentTile === 0}
			<!-- content here -->
			<SastScan projectId={project._id} />
		{:else if currentTile === 1}
			<!-- else if content here -->
			<IastScan projectId={project._id} />
			{:else if currentTile === 2}
			<!-- else content here -->
			<ScaScan projectId={project._id} />
		{/if}
	</div>
</div>
