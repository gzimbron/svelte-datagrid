<script>
	import { slide } from 'svelte/transition';
	import { MENU_LINKS } from '$siteconfig';
</script>

<div
	class="fixed bottom-0 top-16 z-10 flex w-full flex-col justify-between border-e border-t-2 border-t-primary bg-white md:hidden"
	transition:slide
>
	<div class="px-4 py-2">
		<ul class="mt-6 space-y-1">
			{#each MENU_LINKS as { name, url }}
				<li>
					<a
						class="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
						href={url}
						title={name}
					>
						{name}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style lang="postcss">
</style>
