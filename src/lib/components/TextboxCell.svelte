<script lang="ts" generics="T">
	import { getGridState } from '$lib/state/grid.state.js';

	import type { GridCellUpdated, GridColumn } from '$lib/types.js';
	import { afterUpdate, beforeUpdate, createEventDispatcher } from 'svelte';

	type ComponentEventsList = {
		// eslint-disable-next-line no-undef
		valueUpdated: GridCellUpdated<T>;
	};

	const dispatch = createEventDispatcher<ComponentEventsList>();

	const { activeRow } = getGridState();

	// eslint-disable-next-line no-undef
	export let row: T;
	// eslint-disable-next-line no-undef
	export let column: GridColumn<T>;
	export let rowIndex: number;

	let textbox: HTMLInputElement;
	// eslint-disable-next-line no-undef
	let prevColumn: GridColumn<T>;
	// eslint-disable-next-line no-undef
	let prevRow: T;

	function onFocus() {
		activeRow.set(rowIndex);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function onBlur(event: any) {
		if (event.sourceCapabilities) {
			activeRow.set(-1);
		}
	}

	function onInput() {
		const value = textbox.value;
		setTimeout(() => {
			dispatch('valueUpdated', {
				row,
				column,
				value,
				rowIndex
			});
		}, 0);
	}

	beforeUpdate(() => {
		if (prevColumn !== column || prevRow !== row) {
			const updateTextbox = () => {
				if (textbox) textbox.value = row[column.dataKey] + '';
			};
			if (textbox) {
				updateTextbox();
			} else {
				setTimeout(updateTextbox, 0);
			}
			prevColumn = column;
		}
	});

	afterUpdate(() => {
		if (prevRow !== row) {
			if ($activeRow === rowIndex && textbox) {
				textbox.focus();
			} else if (textbox === document.activeElement) {
				textbox.blur();
			}
			prevRow = row;
		}
	});
</script>

<div class="textbox-cell" data-row-index={rowIndex}>
	<input
		id="grid-data-row-{rowIndex}-{column.dataKey}"
		type="text"
		on:input={onInput}
		on:focus={onFocus}
		on:blur={onBlur}
		bind:this={textbox}
	/>
</div>

<style>
	.textbox-cell {
		position: relative;
		width: 100%;
		height: 100%;
		background: var(--textbox-cell-bg, var(--cell-bg, white));
		z-index: 3;
	}
	input {
		height: 100%;
		width: 100%;
		line-height: 90%;
		border: 0;
		margin: 0;
		padding: 0 5px;
		box-sizing: border-box;
		border-radius: 0;
		background: var(--textbox-cell-bg, var(--cell-bg, white));
		color: var(--textbox-cell-color);
	}
</style>
