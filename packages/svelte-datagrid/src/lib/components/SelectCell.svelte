<script lang="ts" generics="T">
	import type { GridCellUpdated, GridColumn, GridColumnOption } from '$lib/types.js';
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

	let select: HTMLSelectElement;

	const onChange = () => {
		dispatch('valueUpdated', {
			row,
			column,
			value: select.value,
			rowIndex
		});
	};

	const getLabel = (label: GridColumnOption['label']) => {
		if (typeof label === 'function') {
			return label();
		}

		return label;
	};
</script>

<label
	for="grid-data-row-{rowIndex}-{column.dataKey}"
	class="select-cell"
	data-row-index={rowIndex}
>
	{#if column.options instanceof Array}
		<select id="grid-data-row-{rowIndex}-{column.dataKey}" on:change={onChange} bind:this={select}>
			{#each column.options as option}
				<option value={option.value} selected={option.value === row[column.dataKey]}>
					{getLabel(option.label)}
				</option>
			{/each}
		</select>
	{/if}
</label>

<style>
	.select-cell {
		overflow: hidden;
		text-overflow: ellipsis;
		background: var(--select-cell-bg, var(--cell-bg, white));
	}
	select {
		border: none;
		background: var(--select-cell-bg, var(--cell-bg, white));
		width: 100%;
		height: 100%;
		padding: 0 5px;
		color: var(--select-cell-color);
	}
</style>
