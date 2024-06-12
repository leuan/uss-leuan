<script>
	import { fetchWithToken } from '$lib/fetchWithToken';
	import {
		getToastStore,
		ProgressBar,
		Paginator,
		Accordion,
		AccordionItem,
		CodeBlock
	} from '@skeletonlabs/skeleton';
	import MdiInformation from '~icons/mdi/information';
	import MdiAlertCircle from '~icons/mdi/alert-circle';
	import MdiAlertDecagram from '~icons/mdi/alert-decagram';
	import MdiReload from '~icons/mdi/reload';
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
		if (project.zap.activeScanFinished) {
			fetchAlerts();
			return;
		}
		if (!project.zap.activeScanFinished) {
			checkActiveScanStatus();
			return;
		}
		if (!project.zap.spiderScanId && spiderScanProgress < 100) {
			checkSpiderScanStatus();
			return;
		}
	});

	const filterAlerts = () => {
		const severities = ['Informational', 'Low', 'Medium', 'High', 'Very High'];
		const sliceValue = Number(minSeverity) - 1;
		filteredAlerts = alerts.filter(
			(e) =>
				e.name.toString().toLowerCase().includes(query.toLowerCase()) &&
				severities.includes(e.risk, sliceValue)
		);
	};

	let spiderScanProgress = 100;
	let activeScanProgress = 0;

	const toastStore = getToastStore();
	const runSpiderScan = async () => {
		spiderScanProgress = 0;
		const postBody = {
			projectId: project._id,
			spiderType: 'crawler'
		};
		const res = await fetchWithToken('/api/v1/scans/zap/spider', {
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
			setTimeout(checkSpiderScanStatus, 1000);
			refresh();
		}
	};

	const checkSpiderScanStatus = async () => {
		try {
			const res = await fetchWithToken(`/api/v1/scans/zap/spider/${project._id}`, {
				method: 'GET'
			});

			if (!res.ok) {
				throw Error('`${res.status}: ${res.statusText}`');
			} else {
				const response = await res.json();
				spiderScanProgress = response.status;
				if (!response.complete) {
					console.log('Polling spider again...');
					setTimeout(checkSpiderScanStatus, 1000);
				} else {
					refresh();
				}
			}
		} catch (e) {
			console.error('Error in polling spider scan: ', e);
		}
	};

	const runActiveScan = async () => {
		activeScanProgress = 0;
		const postBody = {
			projectId: project._id
		};
		const res = await fetchWithToken('/api/v1/scans/zap/active', {
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
			setTimeout(checkActiveScanStatus, 5000);
			refresh();
		}
	};

	const checkActiveScanStatus = async () => {
		console.log('Check active scan');
		try {
			const res = await fetchWithToken(`/api/v1/scans/zap/active/${project._id}`, {
				method: 'GET'
			});

			if (!res.ok) {
				throw Error('`${res.status}: ${res.statusText}`');
			} else {
				const response = await res.json();
				activeScanProgress = response.status;
				if (!response.complete) {
					console.log('Polling active scan again...');
					setTimeout(checkActiveScanStatus, 5000);
				} else {
					refresh();
				}
			}
		} catch (e) {
			console.error('Error in polling active scan: ', e);
		}
	};

	const fetchAlerts = async () => {
		const res = await fetchWithToken(`/api/v1/scans/zap/active/${project._id}`, {
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
</script>

{#if !project.zap.spiderScanId}
	<div class="flex h-full flex-col items-center justify-center gap-10">
		<h1 class="h1 text-surface-400 justify-self-center">You need to run a spider scan first.</h1>
		<button class="btn variant-filled-secondary" on:click={runSpiderScan}>Run spider scan</button>
	</div>
{:else if spiderScanProgress < 100}
	<div class="flex h-full flex-col items-center justify-center gap-10">
		<h1 class="h1 text-surface-400 justify-self-center">Running spider scan...</h1>
		<div class="w-64">
			<ProgressBar value={spiderScanProgress} />
		</div>
	</div>
{:else if !project.zap.activeScanId}
	<div class="flex h-full flex-col items-center justify-center gap-10">
		<h1 class="h1 text-surface-400 justify-self-center">Next, run an active scan.</h1>
		<button class="btn variant-filled-secondary" on:click={runActiveScan}>Run active scan</button>
	</div>
{:else if !project.zap.activeScanFinished}
	<div class="flex h-full flex-col items-center justify-center gap-10">
		<h1 class="h1 text-surface-400 justify-self-center">Running active scan...</h1>
		<div class="w-64">
			<ProgressBar value={activeScanProgress} />
		</div>
	</div>
{:else}
	<div class="">
		<div class="flex items-center justify-between">
			<div class="m-2 w-3/5 flex">
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
				<label class="label px-5 py-3 w-60">
					<select bind:value={minSeverity} on:click={filterAlerts} class="select">
						<option value="1">Informational</option>
						<option value="2">Low</option>
						<option value="3">Medium</option>
						<option value="4">High</option>
						<option value="5">Very High</option>
					</select>
				</label>
			</div>


			<div>
				<button class="btn variant-filled-primary mr-2" on:click={runActiveScan}><MdiReload class="mr-1"/>Active</button>
				<button class="btn variant-filled-primary mr-5" on:click={runSpiderScan}><MdiReload class="mr-1"/>Spider</button>
			</div>
		</div>
		<Accordion autocollapse>
			{#each paginatedAlerts as alert}
				<AccordionItem>
					<svelte:fragment slot="lead">
						{#if alert.risk === 'Informational'}
							<MdiInformation class="text-sky-500" />
						{:else if alert.risk === 'Low'}
							<MdiAlertCircle class="text-yellow-200" />
						{:else if alert.risk === 'Medium'}
							<MdiAlertCircle class="text-yellow-500" />
						{:else if alert.risk === 'High'}
							<MdiAlertDecagram class="text-orange-600" />
						{:else}
							<MdiAlertDecagram class="text-red-500" />
						{/if}
					</svelte:fragment>
					<svelte:fragment slot="summary">
						{alert.name}
					</svelte:fragment>
					<svelte:fragment slot="content">
						<div class="ml-7">
							<p class="text-primary-700 mb-2 font-bold">Confidence: {alert.confidence}</p>
							<div class="mb-4 flex gap-2">
								<span class="badge variant-filled-primary">{alert.method}</span>
								<p class="text-surface-400">{alert.url}</p>
							</div>

							{#if alert.description}
								<p class="mb-2 text-xl">Description:</p>
								<p class="mb-4">{alert.description}</p>
							{/if}

							{#if alert.evidence}
								<p class="mb-2 text-xl">Evidence:</p>
								<CodeBlock class="mb-4" code={alert.evidence}></CodeBlock>
							{/if}

							<p class="mb-2 text-xl">Solution:</p>
							<p class="mb-4">{alert.solution}</p>

							<div class="mb-4 flex gap-2">
								{#if alert.reference}
									<a class="btn variant-filled-secondary" href={alert.reference} rel="external"
										>Reference</a
									>
								{/if}
								{#each Object.entries(alert.tags) as [name, link]}
									<a class="btn variant-filled-tertiary" href={link} rel="external">{name}</a>
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
