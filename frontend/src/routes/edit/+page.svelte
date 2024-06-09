<script>
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { fetchWithToken } from '$lib/fetchWithToken';
	import MdiContentSaveEdit from '~icons/mdi/content-save-edit';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	const queryparams = $page.url.searchParams;
	const projectId = queryparams.get('projectId');

	const toastStore = getToastStore();

	let name = '';
	let zapUrl = '';
	let urlValid = true;
	let scanFileName = '';

	let project = {};
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
		console.log(project);
	};

	onMount(fetchProject);

	const validateURL = (string) => {
		let url;
		try {
			url = new URL(string);
		} catch (_) {
			return false;
		}
		return true;
	};

	const checkField = () => {
		urlValid = validateURL(zapUrl);
		console.log(urlValid);
	};

	const handleSubmit = async () => {
		const project = {
			name,
			zapUrl,
			scanFileName
		};

		const res = await fetchWithToken(`/api/v1/projects/${projectId}`, {
			method: 'POST',
			body: JSON.stringify(project),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!res.ok) {
			toastStore.trigger({
				message: `${res.status}: ${res.statusText}`,
				background: 'variant-filled-error'
			});
			return;
		}

		if (res.ok) {
			toastStore.trigger({
				message: 'Project data changed successfully!',
				background: 'variant-filled-success'
			});
		}
	};
</script>

<Breadcrumb customName={project.name} />
<div class="flex-column flex w-full justify-center">
	<div class="flex-gap-4 ml-8 flex max-w-screen-md flex-col">
		<h1 class="h1 mb-14 mt-7">
			<span
				class="bg-gradient-to-br from-blue-200 to-slate-700 box-decoration-clone bg-clip-text text-transparent"
			>
				Edit your project.
			</span>
		</h1>
		<label class="label mb-3" for="projectName">Project Name:</label>
		<input
			class="input mb-6"
			id="projectName"
			bind:value={name}
			type="text"
			placeholder={project.name}
		/>

		<label class="label mb-3" for="zapURL">Deployment URL:</label>
		<input
			class="input mb-6"
			id="zapURL"
			class:input-error={!urlValid}
			on:keyup={checkField}
			bind:value={zapUrl}
			type="text"
			placeholder={project.zapUrl}
		/>

		<label class="label mb-3" for="scanFileName">Scan file name (without extension):</label>
		<input
			class="input mb-3"
			id="scanFileName"
			on:keyup={checkField}
			bind:value={scanFileName}
			type="text"
			placeholder={project.scanFileName}
		/>

		<button class="btn variant-filled-secondary" on:click={handleSubmit}
			><MdiContentSaveEdit class="mr-1" />Save</button
		>
	</div>
</div>

<style lang="postcss">
</style>
