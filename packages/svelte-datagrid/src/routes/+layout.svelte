<script lang="ts">
	import Header from '$sitecomponent/Header.svelte';
	import '../app.pcss';
	import { SITE_DESCRIPTION, SITE_IMAGE, SITE_NAME, SITE_URL } from '../siteconfig.js';
</script>

<svelte:head>
	<title>{SITE_NAME}</title>
	<meta name="description" content={SITE_DESCRIPTION} />
	<!-- Add SEO tags -->
	<meta name="robots" content="index, follow" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={SITE_NAME} />
	<meta property="og:description" content={SITE_DESCRIPTION} />
	<meta property="og:url" content={SITE_URL} />
	<meta property="og:image" content={SITE_IMAGE} />
	<meta property="og:image:alt" content={SITE_NAME} />
</svelte:head>

<Header></Header>
<main class="mx-auto flex flex-col gap-4 max-w-2xl md:px-0 px-2 mt-4">
	<slot />
</main>
