<script lang="ts">
	export let progress = 0;
</script>

<div>
	<span id="ProgressLabel" class="sr-only">Loading</span>

	<span
		role="progressbar"
		aria-labelledby="ProgressLabel"
		aria-valuenow={progress}
		class="relative block rounded-full bg-white"
	>
		<span class="absolute inset-0 flex items-center justify-center text-[10px]/4">
			<span class="font-bold text-primary" class:text-white={progress > 48}> {progress}% </span>
		</span>

		<span class="block h-4 rounded-full bg-primary text-center" style="width: {progress}%"> </span>
	</span>
</div>

<style lang="postcss">
</style>
