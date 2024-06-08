<script>
	import { fetchWithToken } from '$lib/fetchWithToken';
	import {
		getToastStore,
		Paginator,
		Accordion,
		AccordionItem,
		CodeBlock
	} from '@skeletonlabs/skeleton';
	import MdiInformation from '~icons/mdi/information';
	import MdiAlertCircle from '~icons/mdi/alert-circle';
	import MdiAlertDecagram from '~icons/mdi/alert-decagram';
	import MdiDatabaseImport from '~icons/mdi/database-import';
	import MdiSearch from '~icons/mdi/search';
	import { onMount } from 'svelte';
	export let project = {};
	export let refresh;

	let alerts = [];
	let filteredAlerts = [];
	let paginatedAlerts = [];
	let query = '';
	let minSeverity = '1';

	let paginationSettings = {
		page: 0,
		limit: 6,
		size: filteredAlerts.length,
		amounts: [6, 12, 25, 40]
	};

	$: paginationSettings.size = filteredAlerts.length;

	$: paginatedAlerts = filteredAlerts.slice(
		paginationSettings.page * paginationSettings.limit,
		paginationSettings.page * paginationSettings.limit + paginationSettings.limit
	);

	onMount(() => {
		if (project.lastCodeqlImport) {
			fetchAlerts();
		}
	});

	const filterAlerts = () => {
		const severities = ['low', 'warning', 'error'];
		const sliceValue = Number(minSeverity) - 1;
		filteredAlerts = alerts.filter(
			(e) =>
				e.rule.shortDescription.toString().toLowerCase().includes(query.toLowerCase()) &&
				severities.includes(e.rule.problemSeverity, sliceValue)
		);
	};

	const toastStore = getToastStore();

	const fetchAlerts = async () => {
		const res = await fetchWithToken(`/api/v1/scans/codeql/${project._id}`, {
			method: 'GET'
		});

		if (!res.ok) {
			toastStore.trigger({
				message: `${res.status}: ${res.statusText}`,
				background: 'variant-filled-error'
			});
			return;
		}

		const response = await res.json();
		alerts = response.results;
		filteredAlerts = alerts;
	};

	const importScan = async () => {
		const postBody = {
			projectId: project._id
		};
		const res = await fetchWithToken('/api/v1/scans/codeql', {
			method: 'POST',
			body: JSON.stringify(postBody),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!res.ok) {
			toastStore.trigger({
				message: `${res.status}: ${(await res.json()).message}`,
				background: 'variant-filled-error'
			});
		} else {
			refresh();
			fetchAlerts();
		}
	};
</script>

{#if !project.lastCodeqlImport}
	<div class="flex h-full flex-col items-center justify-center gap-10">
		<h1 class="h1 text-surface-400 justify-self-center">You need to load a CodeQL scan first.</h1>
		<button class="btn variant-filled-secondary" on:click={importScan}>Load</button>
	</div>
{:else}
	<div class="">
		<div class="flex items-center justify-between">
			<div class="m-2 flex w-3/5">
				<div class="input-group input-group-divider my-3 grid-cols-[auto_1fr_auto]">
					<div class="input-group-shim"><MdiSearch /></div>
					<input
						type="search"
						bind:value={query}
						on:keydown={() => {
							(event) => {
								if (event.key === 'Enter') {
									filterAlerts();
								}
							};
						}}
						placeholder="Search..."
					/>
					<button class="variant-filled-secondary" on:click={filterAlerts}> Submit </button>
				</div>
				<label class="label w-60 px-5 py-3">
					<select bind:value={minSeverity} on:click={filterAlerts} class="select">
						<option value="1">Low</option>
						<option value="2">Warning</option>
						<option value="3">Error</option>
					</select>
				</label>
			</div>

			<div>
				<button class="btn variant-filled-primary mr-5" on:click={importScan}
					><MdiDatabaseImport class="mr-1" />Load new scan</button
				>
			</div>
		</div>
		<Accordion autocollapse>
			{#each paginatedAlerts as alert}
				<AccordionItem>
					<svelte:fragment slot="lead">
						{#if alert.rule.problemSeverity === 'low'}
							<MdiAlertCircle class="text-yellow-500" />
						{:else if alert.rule.problemSeverity === 'warning'}
							<MdiAlertCircle class="text-orange-600" />
						{:else if alert.rule.problemSeverity === 'error'}
							<MdiAlertDecagram class="text-red-500" />
						{/if}
					</svelte:fragment>
					<svelte:fragment slot="summary">
						{alert.rule.shortDescription}
					</svelte:fragment>
					<svelte:fragment slot="content">
						<div class="ml-7">
							<p class=" font-weight-100 ml-2  text-indigo-500">Score:</p>
							<h1 class="h1 mb-3">
								<span
									class="text-ellipsis bg-gradient-to-br from-indigo-500 box-decoration-clone bg-clip-text capitalize text-transparent"
									class:to-yellow-500={alert.rule.cvss < 4}
									class:to-orange-500={alert.rule.cvss < 7 && alert.rule.cvss >= 4}
									class:to-red-500={alert.rule.cvss > 7}
								>
									{alert.rule.cvss}
								</span>
							</h1>

							<p class="text-primary-700 mb-2 font-bold">
								Confidence: <span class="capitalize">{alert.rule.confidence} </span>
							</p>
							<div class="text-surface-400 mb-2 flex justify-between">
								<p class="">Rule ID: <span>{alert.rule.id}</span></p>
								<p class="">{alert.location}</p>
							</div>
							<div class="text-surface-400 mb-2 flex">
								{#each alert.rule.tags.filter((e) => !e.includes('cwe')) as tag}
									<span class="badge variant-filled">{tag}</span>
								{/each}
							</div>

							<p class="mb-2 text-xl">Description:</p>
							<p class="mb-4">{alert.rule.fullDescription}</p>
							<CodeBlock class="mb-4" code={alert.detail}></CodeBlock>

							<div class="flex gap-2">
								{#each alert.rule.tags
									.filter((e) => e.includes('cwe'))
									.map((e) => {
										const arr = e.split('/');
										return arr[arr.length - 1];
									}) as tag}
									<a
										class="btn variant-filled-tertiary uppercase"
										href={`https://cwe.mitre.org/data/definitions/${tag.split('-')[1]}.html`}
										rel="external">{tag}</a
									>
								{/each}
							</div>
						</div>
					</svelte:fragment>
				</AccordionItem>
			{/each}
		</Accordion>
		<Paginator
			class="mx-5 my-3"
			bind:settings={paginationSettings}
			showFirstLastButtons={false}
			showPreviousNextButtons={true}
		/>
	</div>
{/if}
