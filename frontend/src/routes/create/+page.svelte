<script>
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { fetchWithToken } from '$lib/fetchWithToken';
	import MdiCreation from '~icons/mdi/creation';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';

	const toastStore = getToastStore();

	let name = '';
	let zapUrl = '';
	let urlValid = true;

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
		if (!urlValid || !zapUrl) {
			toastStore.trigger({
				message: 'You need to enter a valid deployment url!',
				background: 'variant-filled-warning'
			});
			return;
		}

		if (!name) {
			toastStore.trigger({
				message: 'You need to enter a name for your project!',
				background: 'variant-filled-warning'
			});
			return;
		}

		const project = {
			name,
			zapUrl
		};

		const res = await fetchWithToken('/api/v1/projects', {
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
				message: 'Project was created successfully!',
				background: 'variant-filled-success'
			});
		}
	};
</script>

<Breadcrumb/>
<div class="flex w-full flex-column justify-center">
	<div class="flex-gap-4 ml-8 flex max-w-screen-md flex-col">
		<h1 class="h1 mb-14 mt-7">
			<span
				class="bg-gradient-to-br from-amber-200 to-purple-700 box-decoration-clone bg-clip-text text-transparent"
			>
				Create a project.
			</span>
		</h1>
		<label class="label mb-3" for="projectName">Project Name:</label>
		<input
			class="input mb-6"
			id="projectName"
			bind:value={name}
			type="text"
			placeholder="Untitled"
		/>

		<label class="label mb-3" for="zapURL">Deployment URL:</label>
		<input
			class="input mb-3"
			id="zapURL"
			class:input-error={!urlValid}
			on:keyup={checkField}
			bind:value={zapUrl}
			type="text"
			placeholder="http://www.example.com"
		/>

		<button class="btn variant-filled-primary" on:click={handleSubmit}
			><MdiCreation /> Create</button
		>
	</div>
</div>

<style lang="postcss">
</style>
