<script lang="ts" generics="T">
	import type { GridCellUpdated, GridColumn } from '$lib/types.js';
	import { createEventDispatcher } from 'svelte';

	type ComponentEventsList = {
		// eslint-disable-next-line no-undef
		valueUpdated: GridCellUpdated<T>;
	};
	const dispatch = createEventDispatcher<ComponentEventsList>();

	// eslint-disable-next-line no-undef
	export let row: T;
	// eslint-disable-next-line no-undef
	export let column: GridColumn<T>;
	export let rowIndex: number;

	let checkbox: HTMLInputElement;

	const onClick = () => {
		dispatch('valueUpdated', {
			row,
			column,
			value: checkbox.checked,
			rowIndex
		});
	};
</script>

<div class="checkbox-cell" data-row-index={rowIndex}>
	<input
		id="grid-data-row-{rowIndex}-{column.dataKey}"
		type="checkbox"
		bind:this={checkbox}
		checked={!!row[column.dataKey]}
		on:click={onClick}
	/>
</div>

<style lang="postcss">
	.checkbox-cell {
		text-align: center;
	}
</style>
