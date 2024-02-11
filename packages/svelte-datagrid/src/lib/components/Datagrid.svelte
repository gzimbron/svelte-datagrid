<script lang="ts" generics="T">
	import { quadIn } from 'svelte/easing';
	import { flip, type FlipParams } from 'svelte/animate';

	import { dragAndDrop } from '$lib/actions/dragAndDrop.js';
	import { createGridState } from '$lib/state/grid.state.js';
	import type { GridCellUpdated, GridColumn, GridProps, GridRow } from '$lib/types.js';
	import { beforeUpdate, createEventDispatcher } from 'svelte';

	// eslint-disable-next-line no-undef, @typescript-eslint/no-unused-vars
	interface $$Props extends GridProps<T> {}

	type ComponentEventsList = {
		scroll: number;
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

	let svelteGridWrapper: HTMLDivElement;
	let gridBody: HTMLDivElement;
	let isResizing = false;
	let isDragging = false;
	let columnDragging = -1;
	let gridHeight = 0;
	// eslint-disable-next-line no-undef
	let visibleRows: GridRow<T>[];
	let scrolledPercent = 0;

	let {
		columnWidth,
		gridSpaceWidth,
		scrollTop,
		scrollLeft,
		visibleRowsIndexes,
		xPositions,
		getRowTop,
		getCellZIndex,
		setNewScrollPositions,
		setGridHeight,
		totalRows,
		rowHeight: gridRowHeight,
		recalculateColumnWidths
	} = createGridState({
		columns,
		rowHeight,
		extraRows,
		totalRows: rows.length
	});

	beforeUpdate(() => {
		if (rowHeight < MIN_ROW_HEIGHT) {
			rowHeight = MIN_ROW_HEIGHT;
		}

		if ($totalRows != rows.length) {
			totalRows.set(rows.length);
			scrollToRefreshView();
		}

		if (rowHeight != $gridRowHeight) {
			gridRowHeight.set(rowHeight);

			updateVisibleRows($visibleRowsIndexes.start, $visibleRowsIndexes.end);
			scrollToRefreshView();
		}
	});

	$: gridSpaceHeight = $gridRowHeight * rows.length;
	$: updateVisibleRows($visibleRowsIndexes.start, $visibleRowsIndexes.end);
	$: setGridHeight(gridHeight);

	const scrollToRefreshView = () => {
		gridBody.scrollTo({
			top: $scrollTop - 1,
			left: $scrollLeft - 1,
			behavior: 'smooth'
		});
	};

	const updateVisibleRows = (start: number, end: number) => {
		visibleRows = rows.slice(start, end).map((x, i) => {
			return {
				i: i + start,
				data: x
			};
		});
	};

	// eslint-disable-next-line no-undef
	const valueUpdated = ({ detail }: CustomEvent<GridCellUpdated<T>>) => {
		rows[detail.rowIndex] = { ...rows[detail.rowIndex], [detail.column.dataKey]: detail.value };
		visibleRows[detail.rowIndex] = { i: detail.rowIndex, data: rows[detail.rowIndex] };
		dispatch('valueUpdated', detail);
	};

	const updateScrollPercent = () => {
		if (!gridBody) return;

		const percent = Math.round(
			(gridBody.scrollTop / (gridBody.scrollHeight - gridBody.clientHeight)) * 100
		);

		setNewScrollPositions(gridBody.scrollTop, gridBody.scrollLeft);

		if (scrolledPercent === percent) return;
		scrolledPercent = percent;
		dispatch('scroll', scrolledPercent);
	};

	const resetDraggind = () => {
		isDragging = false;
		columnDragging = -1;
	};

	const swapColumns = (fromColumn: number, toColumn: number) => {
		const from = columns[fromColumn];
		const to = columns[toColumn];
		columns[fromColumn] = to;
		columns[toColumn] = from;

		recalculateColumnWidths(columns);

		dispatch('columnsSwapped', {
			from,
			to,
			columns
		});
	};
</script>

<div
	bind:this={svelteGridWrapper}
	bind:offsetHeight={gridHeight}
	role="table"
	class="svelte-grid"
	style:--row-height="{$gridRowHeight}px"
	style:--grid-space-width="{gridSpaceWidth}px"
	style:--grid-space-height="{gridSpaceHeight}px"
	style:--top-scroll="{$scrollTop}px"
	style:--left-scroll="{$scrollLeft}px"
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
					style:z-index={getCellZIndex(i)}
					style:left="{$xPositions[i]}px"
					style:width="{$columnWidth[i]}px"
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

	<div
		role="rowgroup"
		class="svelte-grid-body"
		bind:this={gridBody}
		on:scroll={updateScrollPercent}
	>
		<div class="grid-space"></div>

		{#each visibleRows as row}
			<div class="grid-row" style:top="{getRowTop(row.i)}px" role="row" aria-rowindex={row.i}>
				{#each columns as column, j (j)}
					<div
						class="grid-cell"
						role="cell"
						data-column={j}
						data-row={row.i}
						style="width:{$columnWidth[j]}px"
						style:z-index={getCellZIndex(j)}
						style:left="{$xPositions[j]}px"
						class:draggableColumnCell={allColumnsDraggable || column.draggable}
						animate:flip={animationParams}
					>
						<div class="cell-container" class:cell-default={!column.cellComponent}>
							{#if column.cellComponent}
								<svelte:component
									this={column.cellComponent}
									rowIndex={row.i}
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
		left: calc(var(--left-scroll) * -1);
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
