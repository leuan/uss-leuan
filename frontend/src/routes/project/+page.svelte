<script>
	import { page } from '$app/stores';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	const queryparams = $page.url.searchParams;
	const projectId = queryparams.get('projectId');
</script>

<Breadcrumb customName="Test"/>
<p>{projectId}</p>