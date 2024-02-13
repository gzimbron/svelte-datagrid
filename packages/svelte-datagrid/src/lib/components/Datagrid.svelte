<script lang="ts" generics="T">
	import { swapGridColums } from '$lib/functions/gridHelpers.js';

	import { writable } from 'svelte/store';

	import {
		calculateGridSpaceWidth,
		calculatePercent,
		calculateXPositions,
		getRowTop,
		getVisibleRowsIndexes,
		updateColumnWidths
	} from '$lib/functions/calculateFunctions.js';

	import { flip, type FlipParams } from 'svelte/animate';
	import { quadIn } from 'svelte/easing';

	import { dragAndDrop } from '$lib/actions/dragAndDrop.js';

	import type { GridCellUpdated, GridColumn, GridProps, GridRow } from '$lib/types.js';
	import { beforeUpdate, createEventDispatcher, setContext } from 'svelte';

	// eslint-disable-next-line no-undef, @typescript-eslint/no-unused-vars
	interface $$Props extends GridProps<T> {
		/**
		 * Get the current grid state like visible rows indexes, scroll position, etc.
		 */
		getGridState?: typeof getGridState;
		scrollToRow?: typeof scrollToRow;
	}

	setContext('activeRow', writable(-1));

	type ComponentEventsList = {
		scroll: number;
		xScroll: number;
		// eslint-disable-next-line no-undef
		valueUpdated: GridCellUpdated<T>;
		// eslint-disable-next-line no-undef
		columnsSwapped: { from: GridColumn<T>; to: GridColumn<T>; columns: $$Props['columns'] };
	};
	const dispatch = createEventDispatcher<ComponentEventsList>();

	const MIN_ROW_HEIGHT = 20;

	// eslint-disable-next-line no-undef
	export let columns: $$Props['columns'];
	// eslint-disable-next-line no-undef
	export let rows: $$Props['rows'];
	export let rowHeight = 30;
	export let extraRows = 0;
	export let allColumnsDraggable = false;
	export let animationParams: FlipParams = {
		duration: 150,
		delay: 0,
		easing: quadIn
	};

	export const scrollToRow = (rowIndex: number) => {
		if (!gridBody) return;
		gridBody.scrollTo({
			top: rowIndex * rowHeight,
			behavior: 'smooth'
		});
	};

	export const getGridState = () => {
		return {
			visibleRowsIndexes,
			scrollTop,
			scrollLeft,
			yScrollPercent,
			xScrollPercent
		};
	};

	let svelteGridWrapper: HTMLDivElement;
	let gridBody: HTMLDivElement;
	let isResizing = false;
	let isDragging = false;
	let columnDragging = -1;
	let yScrollPercent = 0;
	let xScrollPercent = 0;

	beforeUpdate(() => {
		if (rowHeight < MIN_ROW_HEIGHT) {
			rowHeight = MIN_ROW_HEIGHT;
			scrollToRefreshView();
		}
	});

	let scrollTop = 0;
	let scrollLeft = 0;

	$: columnWidths = updateColumnWidths(columns);
	$: gridSpaceWidth = calculateGridSpaceWidth(columnWidths);
	$: xPositions = calculateXPositions(columnWidths);
	$: totalRows = rows.length;
	$: gridSpaceHeight = rowHeight * rows.length;
	$: visibleRowsIndexes = getVisibleRowsIndexes(
		rowHeight,
		scrollTop,
		gridBody?.clientHeight,
		totalRows,
		extraRows
	);
	$: visibleRows = rows
		.slice(visibleRowsIndexes.start, visibleRowsIndexes.end)
		// eslint-disable-next-line no-undef
		.map((x, i): GridRow<T> => {
			return {
				i: i + visibleRowsIndexes.start,
				data: x
			};
		});

	$: {
		if (totalRows) {
			scrollToRefreshView();
		}
		if (rowHeight) {
			onScroll();
			scrollToRefreshView();
		}
	}

	const scrollToRefreshView = () => {
		if (!gridBody) return;
		gridBody.scrollTo({
			top: scrollTop - 1,
			behavior: 'smooth'
		});
	};

	// eslint-disable-next-line no-undef
	const valueUpdated = ({ detail }: CustomEvent<GridCellUpdated<T>>) => {
		rows[detail.rowIndex] = { ...rows[detail.rowIndex], [detail.column.dataKey]: detail.value };
		visibleRows[detail.virtualRowIndex].data = rows[detail.rowIndex];

		dispatch('valueUpdated', detail);
	};

	const onScroll = () => {
		if (!gridBody) return;

		scrollTop = gridBody.scrollTop;
		scrollLeft = gridBody.scrollLeft;

		const percentY = calculatePercent(scrollTop, gridBody.scrollHeight - gridBody.clientHeight);
		const percentX = calculatePercent(scrollLeft, gridSpaceWidth - gridBody.clientWidth);

		if (percentX != xScrollPercent && percentX >= 0 && percentX <= 100) {
			xScrollPercent = percentX;
			dispatch('xScroll', xScrollPercent);
		}

		if (percentY != yScrollPercent && percentY >= 0 && percentY <= 100) {
			yScrollPercent = percentY;
			dispatch('scroll', yScrollPercent);
		}
	};

	const resetDraggind = () => {
		isDragging = false;
		columnDragging = -1;
	};

	const swapColumns = (fromColumn: number, toColumn: number) => {
		const detail = swapGridColums(columns, fromColumn, toColumn);

		columns = [...detail.columns];
		dispatch('columnsSwapped', detail);
	};
</script>

<div
	bind:this={svelteGridWrapper}
	role="table"
	class="svelte-grid"
	style:--row-height="{rowHeight}px"
	style:--grid-space-width="{gridSpaceWidth}px"
	style:--grid-space-height="{gridSpaceHeight}px"
	class:resizing={isResizing || isDragging}
	class:isDragging
>
	<div class="svelte-grid-head" role="rowgroup">
		<div role="row" class="header-row">
			{#each columns as column, i (i)}
				<div
					tabindex={i}
					class="columnheader grid-cell"
					title={column.label || ''}
					role="columnheader"
					style:left="{xPositions[i]}px"
					style:width="{columnWidths[i]}px"
					class:draggable={allColumnsDraggable || column.draggable}
					class:dragging={false}
					animate:flip={animationParams}
					use:dragAndDrop={{
						draggable: allColumnsDraggable || column.draggable,
						dragStart: () => {
							isDragging = true;
							columnDragging = i;
						},
						dragEnd: (e) => {
							isDragging = false;

							const { clientX, clientY } = e;
							if (
								clientX < svelteGridWrapper.offsetLeft ||
								clientX > svelteGridWrapper.offsetLeft + svelteGridWrapper.offsetWidth ||
								clientY < svelteGridWrapper.offsetTop ||
								clientY > svelteGridWrapper.offsetTop + svelteGridWrapper.offsetHeight
							) {
								resetDraggind();
								return;
							}

							svelteGridWrapper.querySelectorAll('.columnheader').forEach((el, index) => {
								const { left, right } = el.getBoundingClientRect();
								if (
									clientX > left &&
									clientX < right &&
									(allColumnsDraggable || columns[index].draggable) &&
									index != columnDragging
								) {
									swapColumns(columnDragging, index);
								}
							});

							resetDraggind();
						}
					}}
				>
					<div class="cell-container" class:cell-default={!column.headerComponent}>
						{#if column.headerComponent}
							<svelte:component this={column.headerComponent} {column} />
						{:else}
							{column.label || ''}
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div role="rowgroup" class="svelte-grid-body" bind:this={gridBody} on:scroll={onScroll}>
		<div class="grid-space"></div>

		{#each visibleRows as row, virtualRowIndex}
			<div
				class="grid-row"
				style:top="{getRowTop(row.i, rowHeight)}px"
				role="row"
				aria-rowindex={row.i}
			>
				{#each columns as column, j (j)}
					<div
						class="grid-cell"
						role="cell"
						data-column={j}
						data-row={row.i}
						style="width:{columnWidths[j]}px"
						style:left="{xPositions[j]}px"
						class:draggableColumnCell={allColumnsDraggable || column.draggable}
						animate:flip={animationParams}
					>
						<div class="cell-container" class:cell-default={!column.cellComponent}>
							{#if column.cellComponent}
								<svelte:component
									this={column.cellComponent}
									rowIndex={row.i}
									{virtualRowIndex}
									{column}
									row={row.data}
									on:valueUpdated={valueUpdated}
								/>
							{:else}
								{row.data[column.dataKey] || ''}
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style lang="postcss">
	.resizing * {
		user-select: none;
	}

	.resizing .svelte-grid-body {
		overflow-y: hidden;
	}

	.resizing .grid-space {
		pointer-events: all;
	}

	.isDragging .columnheader:not(.draggable) {
		opacity: var(--no-draggable-opacity, 0.4);
	}
	.isDragging .columnheader:not(.draggable)::after {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		width: 100%;
		height: 100%;
		opacity: var(--no-draggable-opacity, 0.4);
		background-color: var(--no-draggable-fg, rgba(66, 66, 66, 0.5));
	}

	.draggable :hover {
		content: '';
		position: absolute;
		background-color: var(--draggable-bg, rgba(33, 248, 255, 0.5));
		top: 0;
		right: 0;
		width: 100%;
		height: 100%;
	}

	.columnheader.dragging {
		border: var(--border, 1px solid #666);
		background-color: var(--dragging-bg, rgba(33, 255, 151, 0.5));
	}
	.columnheader.dragging > * {
		opacity: 0.6;
	}

	.isDragging .svelte-grid-body .grid-cell:not(.draggableColumnCell) {
		opacity: var(--no-draggable-opacity, 0.5);
	}
	.isDragging .svelte-grid-body .grid-cell:not(.draggableColumnCell)::after {
		content: '';
		position: absolute;
		z-index: 3;
		top: 0;
		right: 0;
		width: 100%;
		height: 100%;
		background-color: var(--no-draggable-fg, rgba(66, 66, 66, 0.5));
	}

	.cell-container {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.cell-default {
		padding: 0 5px;
	}

	.svelte-grid {
		position: relative;
		height: 100%;
		width: auto;
		max-width: var(--grid-space-width);
		background: var(--cell-bg, white);
		color: var(--cell-color);
		border: var(--border, 1px solid #666);
	}

	.svelte-grid > * {
		box-sizing: border-box;
	}

	.svelte-grid-head {
		position: absolute;
		overflow: hidden;
		width: 100%;
		max-width: 100%;
		background: var(--head-bg, white);
		border-bottom-width: var(--header-border, 2px);
		border-bottom-color: var(--header-border-color, #666);
		border-bottom-style: solid;
		color: var(--head-color);
		z-index: 2;
	}

	.header-row {
		width: var(--grid-space-width);
		height: var(--row-height);
		flex-direction: row;
		position: relative;
		top: 0;
		left: 0;
	}

	.columnheader .cell-default {
		white-space: nowrap;
		font-weight: bold;
		text-align: center;
	}

	.svelte-grid-body {
		position: absolute;
		top: calc(var(--row-height) + var(--header-border, 2px));
		height: calc(100% - var(--row-height) - var(--header-border, 2px));
		width: 100%;
		overflow: auto;
	}

	.grid-row {
		height: var(--row-height);
		width: var(--grid-space-width);
		position: absolute;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.grid-row:not(:last-child) {
		border-bottom: var(--border, 1px solid #666);
	}

	.grid-space {
		height: var(--grid-space-height);
		width: var(--grid-space-width);
	}

	.grid-cell {
		position: absolute;
		top: 0;
		text-overflow: ellipsis;
		overflow: hidden;
		height: var(--row-height);
		line-height: var(--row-height);
	}

	.grid-cell:not(:last-child) {
		border-right: var(--border, 1px solid #666);
	}
	.grid-cell > * {
		height: 100%;
	}
</style>
