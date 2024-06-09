<script>
	import { goto } from '$app/navigation';
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
	import { AppRail, AppRailTile, ProgressRadial, getToastStore} from '@skeletonlabs/skeleton';
	const queryparams = $page.url.searchParams;
	const projectId = queryparams.get('projectId');
	const toastStore = getToastStore();
	
	let loading = true;
	let project = {};
	let currentTile = 0;

	const fetchProject = async () => {
		if (!projectId) {
			await goto('/404');
		}
		const res = await fetchWithToken(`/api/v1/projects/${projectId}`);
		if (!res.ok) {
			if(res.status === 404) {
				await goto('/404');
				return;
			}
			toastStore.trigger({
				message: `${res.status}: ${res.statusText}`,
				background: 'variant-filled-error'
			});
			return;
		}
		project = (await res.json()).result;
		loading = false;
	};

	onMount(fetchProject);
</script>

{#if loading}
	<div class="flex h-full w-full items-center justify-center">
		<ProgressRadial />
	</div>
{:else}
	<div class="mb-6">
		<Breadcrumb customName={project?.name} />
		<div class="mx-7 mb-1 mt-3 flex items-center gap-4">
			<h1 class="h1">
				<span
					class="from-secondary-500 to-warning-500 text-ellipsis bg-gradient-to-br box-decoration-clone bg-clip-text capitalize text-transparent"
				>
					{project.name}
				</span>
			</h1>
			<a class="btn btn-icon variant-filled-secondary" href={`/edit?projectId=${project._id}`}><MdiEdit /></a>
			<a class="btn btn-icon variant-filled-warning" href={project.zapUrl} rel="external"><MdiLink /></a>
		</div>
		<div class="text-surface-400 ml-8 flex items-center gap-2">
			<p>URL: {project.zapUrl}</p>
			<p>-</p>
			<p>Created: {new Date(project.createdAt).toLocaleDateString()}</p>
			<p>-</p>
			<p>Last spider scan: {project.zap.lastSpiderScan ? new Date(project.zap.lastSpiderScan).toLocaleDateString() : 'never'}</p>
			<p>-</p>
			<p>Last active scan: {project.zap.lastActiveScan ? new Date(project.zap.lastActiveScan).toLocaleDateString() : 'never'}</p>
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

		<div class="flex-1 min-h-96">
			{#if currentTile === 0}
				<SastScan project={project} refresh={fetchProject} />
			{:else if currentTile === 1}
				<IastScan project={project} refresh={fetchProject}/>
			{:else if currentTile === 2}
				<ScaScan project={project} refresh={fetchProject}/>
			{/if}
		</div>
	</div>
{/if}
