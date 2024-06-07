<script>
    import { page } from "$app/stores";
    import MdiHome from '~icons/mdi/home';
    let path, query;
    export let customName = '';
    $: path = ($page.url.pathname).split('/').filter((e) => e !== '')
    $: console.log(path)
    $: query = $page.url.searchParams


</script>
<ol class="breadcrumb mt-2 ml-4">
	<li class="crumb"><a class="anchor" href="/"><MdiHome/></a></li>
    {#each path as element}
	<li class="crumb-separator" aria-hidden="true">&rsaquo;</li>
	<li class="crumb capitalize">{element}</li>
    {/each}
    {#if query.get('projectId')}
	<li class="crumb-separator" aria-hidden="true">&rsaquo;</li>
	<li class="capitalize">{customName || query.get('projectId')}</li>
    {/if}
</ol>