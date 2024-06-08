<script lang="ts">
	import { get } from 'svelte/store';
	import '../app.postcss';
	import {
		AppShell,
		AppBar,
		ProgressRadial,
		initializeStores,
		Toast
	} from '@skeletonlabs/skeleton';
	import { user, initKeycloak, logout, account } from '$lib/auth';
	import { onMount } from 'svelte';
	import MdiAccount from '~icons/mdi/account';
	import MdiLogoutVariant from '~icons/mdi/logout-variant';

	// Highlight JS
	import hljs from 'highlight.js/lib/core';
	import 'highlight.js/styles/github-dark.css';
	import { storeHighlightJs } from '@skeletonlabs/skeleton';
	import xml from 'highlight.js/lib/languages/xml'; // for HTML
	import css from 'highlight.js/lib/languages/css';
	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';
	import plaintext from 'highlight.js/lib/languages/plaintext'

	let userProfile;
	let isLoading = true;
	let keycloak;

	onMount(async () => {
		await initKeycloak();
		userProfile = get(user);
		keycloak = get(user);
		isLoading = false;
	});
	initializeStores();
	
	hljs.registerLanguage('xml', xml); // for HTML
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('typescript', typescript);
	hljs.registerLanguage('plaintext', plaintext);
	storeHighlightJs.set(hljs);

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
</script>

<!-- App Shell -->
{#if isLoading}
	<div class="flex h-full w-full items-center justify-center">
		<ProgressRadial />
	</div>
{:else}
	<Toast/>
	<AppShell>
		<svelte:fragment slot="header">
			<!-- App Bar -->
			<!-- {#if isLoading} -->
			<AppBar>
				<svelte:fragment slot="lead">
					<strong class="strong">
						<span
							class="bg-gradient-to-br from-pink-500 to-violet-500 box-decoration-clone bg-clip-text text-transparent"
							>Welcome, {userProfile?.firstName}</span
						>
					</strong>
					<strong class="text-xl uppercase"></strong>
				</svelte:fragment>
				<svelte:fragment slot="trail">
					<button
						type="button"
						on:click={account}
						class="btn-icon variant-gradient-success-error bg-gradient-to-br"><MdiAccount /></button
					>
					<button type="button" on:click={logout} class="btn-icon variant-filled-surface"
						><MdiLogoutVariant /></button
					>
				</svelte:fragment>
			</AppBar>
		</svelte:fragment>
		<!-- Page Route Content -->

		<slot></slot>
	</AppShell>
{/if}
