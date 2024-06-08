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

	let dependencies = [];
	let filteredDependencies = [];
	let paginatedDependencies = [];
	let query = '';

	let paginationSettings = {
		page: 0,
		limit: 6,
		size: filteredDependencies.length,
		amounts: [6, 12, 25, 40]
	};

	$: paginationSettings.size = filteredDependencies.length;

	$: paginatedDependencies = filteredDependencies.slice(
		paginationSettings.page * paginationSettings.limit,
		paginationSettings.page * paginationSettings.limit + paginationSettings.limit
	);

	onMount(() => {
		if (project.lastCodeqlImport) {
			fetchDependencies();
		}
	});

	const filterDependencies = () => {
		filteredDependencies = dependencies.filter((e) =>
			e.name.toString().toLowerCase().includes(query.toLowerCase())
		);
	};

	const toastStore = getToastStore();

	const fetchDependencies = async () => {
		const res = await fetchWithToken(`/api/v1/scans/dc/${project._id}`, {
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
		dependencies = response.results;
		filteredDependencies = dependencies;
	};

	const importScan = async () => {
		const postBody = {
			projectId: project._id
		};
		const res = await fetchWithToken('/api/v1/scans/dc', {
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
			fetchDependencies();
		}
	};
</script>

{#if !project.lastDependencyCheckImport}
	<div class="flex h-full flex-col items-center justify-center gap-10">
		<h1 class="h1 text-surface-400 justify-self-center">
			You need to load a Dependency-Check report first.
		</h1>
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
									filterDependencies();
								}
							};
						}}
						placeholder="Search..."
					/>
					<button class="variant-filled-secondary" on:click={filterDependencies}> Submit </button>
				</div>
			</div>

			<div>
				<button class="btn variant-filled-primary mr-5" on:click={importScan}
					><MdiDatabaseImport class="mr-1" />Load report</button
				>
			</div>
		</div>
		<Accordion autocollapse>
			{#each paginatedDependencies as dependency}
				<AccordionItem>
					<svelte:fragment slot="lead">
						<span class="text-orange-600">{dependency.vulnerabilities.length}</span>
					</svelte:fragment>
					<svelte:fragment slot="summary">
						{dependency.name}
					</svelte:fragment>
					<svelte:fragment slot="content">
						<div class="ml-7">
							<h1 class="h1 mb-2 text-3xl">{dependency.name}</h1>
							<p class="text-surface-400 mb-2">Version: {dependency.version}</p>
						</div>
						<Accordion autocollapse>
							{#each dependency.vulnerabilities as vulnerability}
								<AccordionItem>
									<svelte:fragment slot="summary">{vulnerability.name}</svelte:fragment>
									<svelte:fragment slot="content">
										<p class="text-surface-400 mb-2">Source: {vulnerability.source}</p>
										<div class="flex gap-10">
											<div>
												<p class=" font-weight-100 text-indigo-500">CVSS v2 Score:</p>
												<h1 class="h1 mb-3 ml-4">
													<span
														class="text-ellipsis bg-gradient-to-br from-indigo-500 box-decoration-clone bg-clip-text capitalize text-transparent"
														class:to-yellow-500={vulnerability.cvss2 < 4}
														class:to-orange-500={vulnerability.cvss2 < 7 &&
															vulnerability.cvss2 >= 4}
														class:to-red-500={vulnerability.cvss2 > 7}
													>
														{vulnerability.cvss2}
													</span>
												</h1>
											</div>
											<div>
												<p class=" font-weight-100 text-indigo-500">CVSS v3 Score:</p>
												<h1 class="h1 mb-3 ml-4">
													<span
														class="text-ellipsis bg-gradient-to-br from-indigo-500 box-decoration-clone bg-clip-text capitalize text-transparent"
														class:to-yellow-500={vulnerability.cvss3 < 4}
														class:to-orange-500={vulnerability.cvss3 < 7 &&
															vulnerability.cvss3 >= 4}
														class:to-red-500={vulnerability.cvss3 > 7}
													>
														{vulnerability.cvss3}
													</span>
												</h1>
											</div>
										</div>

										<p class="mb-2 text-xl">Description:</p>
										<p class="mb-4">{vulnerability.description}</p>

										{#if vulnerability.name.includes('CVE')}
											<a
												class="btn variant-filled"
												href={`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${vulnerability.name.slice(4)}`}
												>{vulnerability.name}</a
											>
										{/if}
									</svelte:fragment>
								</AccordionItem>
							{/each}
						</Accordion>
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
