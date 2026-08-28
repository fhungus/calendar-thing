<script lang="ts">
	import favicon from '$lib/assets/fortnite.jpg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<link rel="preconnect" href="https://fontlay.com">
<link href="https://fontlay.com/css2?family=Fira+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">

{@render children()}

<style>
	:global(body) {
		font-family: "Fira Sans", monospace;
		background-color: var(--bg);
	}
</style>
