<script lang="ts">
	import { MENU_LINKS, SITE_GITHUB_URL, SITE_NAME, SITE_URL } from '$siteconfig';
	import GitHubIcon from './GitHubIcon.svelte';
	import Sidebar from './Sidebar.svelte';

	let showmenu = false;

	const menuToggle = () => {
		showmenu = !showmenu;
	};
</script>

<header class="bg-white">
	<div class="mx-auto flex h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8">
		<a
			class="block tracking-tight text-primary transition hover:text-secondary"
			title={SITE_NAME}
			href={SITE_URL}
		>
			<h1 class="sr-only">{SITE_NAME}</h1>
			<img src="/logo.webp" alt={SITE_NAME} class="w-40" />
		</a>

		<div class="flex flex-1 items-center justify-end md:justify-between">
			<nav aria-label="Global" class="hidden md:block">
				<ul class="flex items-center gap-6 text-sm">
					{#each MENU_LINKS as { name, url }}
						<li>
							<a class="text-gray-500 transition hover:text-gray-500/75" href={url} title={name}>
								{name}
							</a>
						</li>
					{/each}
				</ul>
			</nav>

			<div class="flex items-center gap-4">
				<div class="sm:flex sm:gap-4">
					<a href={SITE_GITHUB_URL} target="_blank">
						<GitHubIcon></GitHubIcon>
					</a>
				</div>
				<button
					class="block rounded bg-gray-100 p-2.5 text-gray-600 transition hover:text-gray-600/75 md:hidden"
					class:bg-gray-200={showmenu}
					on:click={menuToggle}
				>
					<span class="sr-only">Toggle menu</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
			</div>
		</div>
	</div>
</header>

{#if showmenu}
	<Sidebar></Sidebar>
{/if}

<style lang="postcss">
</style>
