<script>
	import { page } from '$app/stores';
	const queryparams = $page.url.searchParams;
	const projectId = queryparams.get('projectId');
</script>

<p>{projectId}</p>