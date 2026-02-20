<script lang="ts" generics="T">
	import { reziseColumn } from '$lib/actions/resizeColumn.js';

	import { MIN_ROW_HEIGHT } from '$lib/configurations.js';

	import type { GridProps } from '$lib/DataGridProps.js';

	import { swapGridColums } from '$lib/functions/gridHelpers.js';

	import { writable } from 'svelte/store';

	import {
		calculateDefaultRowsPerPage,
		calculateFrozenLeftOffsets,
		calculateFrozenRightOffsets,
		calculateGridSpaceWidth,
		calculatePercent,
		getRowTop,
		getVisibleRowsIndexes,
		MIN_COLUMN_WIDTH,
		updateColumnWidths
	} from '$lib/functions/calculateFunctions.js';

	import { flip, type FlipParams } from 'svelte/animate';
	import { quadIn } from 'svelte/easing';

	import { dragAndDrop } from '$lib/actions/dragAndDrop.js';

	import type { GridCellUpdated, GridColumn, GridRow } from '$lib/types.js';
	import { beforeUpdate, createEventDispatcher, setContext } from 'svelte';

	// eslint-disable-next-line no-undef, @typescript-eslint/no-unused-vars
	interface $$Props extends GridProps {
		/**
		 * The columns of the grid
		 */
		// eslint-disable-next-line no-undef
		columns: GridColumn<T>[];
		/**
		 * The rows of the grid
		 */
		// eslint-disable-next-line no-undef
		rows: T[];
		/**
		 * The number of rows to render per page
		 * @default rows.length > 10 ? 10 : rows.length
		 */
		rowsPerPage?: number;
		/**
		 * The height of the grid rows in pixels
		 */
		headerRowHeight?: number;
		/**
		 * The height of the grid rows in pixels
		 */
		rowHeight?: number;
		/**
		 * Slice of extra rows to render outside the viewport
		 */
		extraRows?: number;

		/**
		 * Set all columns draggable by default, ignoring the `draggable` property of each column
		 */
		allColumnsResizable?: boolean;

		/**
		 * Set all columns draggable by default, ignoring the `draggable` property of each column
		 */
		allColumnsDraggable?: boolean;

		/**
		 * Get the current grid state like visible rows indexes, scroll position, etc.
		 */
		getGridState?: typeof getGridState;
		/**
		 * Scroll to a specific row index
		 */
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
		// eslint-disable-next-line no-undef
		rowClick: { row: GridRow<T> };
		// eslint-disable-next-line no-undef
		rowDblClick: { row: GridRow<T> };
	};
	const dispatch = createEventDispatcher<ComponentEventsList>();

	// eslint-disable-next-line no-undef
	export let columns: $$Props['columns'];
	// eslint-disable-next-line no-undef
	export let rows: $$Props['rows'];
	export let rowHeight = 24;
	export let headerRowHeight = 24;
	export let extraRows = 0;
	export let rowsPerPage = calculateDefaultRowsPerPage(rows.length);
	export let allColumnsDraggable = false;
	export let allColumnsResizable = false;
	export let animationParams: FlipParams = {
		duration: 150,
		delay: 0,
		easing: quadIn
	};

	const NO_TRANSITION_EFFECT = {
		duration: 0,
		delay: 0,
		easing: undefined
	};

	if (!columns || columns.length < 1) {
		throw new Error('Columns are required');
	}

	if (!rows) {
		throw new Error('Rows are required');
	}

	// eslint-disable-next-line no-undef
	export const scrollToRow = (rowIndex: number, behavior: ScrollBehavior = 'smooth') => {
		if (!gridBody) return;
		gridBody.scrollTo({
			top: rowIndex * rowHeight,
			behavior
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
	let bodyClientWidth = 0;
	let isResizing = false;
	let isDragging = false;
	let columnDragging = -1;
	let columnDropTarget = -1;
	let columnResizing = -1;
	let yScrollPercent = 0;
	let xScrollPercent = 0;

	beforeUpdate(() => {
		if (rowHeight < MIN_ROW_HEIGHT) {
			rowHeight = MIN_ROW_HEIGHT;
			scrollToRefreshView();
		}
		if (rowsPerPage < 1) {
			rowsPerPage = 1;
		}
	});

	let scrollTop = 0;
	let scrollLeft = 0;
	let visibleRowsIndexes: ReturnType<typeof getVisibleRowsIndexes> = { start: 0, end: rowsPerPage };

	$: columnWidths = updateColumnWidths(columns);
	$: gridSpaceWidth = calculateGridSpaceWidth(columnWidths);
	$: frozenLeftOffsets = calculateFrozenLeftOffsets(columns, columnWidths);
	$: frozenRightOffsets = calculateFrozenRightOffsets(columns, columnWidths);

	// Reactive cell positions: frozen columns pinned to edges, non-frozen laid out without gaps
	$: cellLeftPositions = (() => {
		const positions = new Array(columns.length).fill(0);

		// Total width of frozen-left columns (reserve space at left)
		const frozenLeftTotal = columns.reduce(
			(sum, col, i) => (col.frozen === 'left' ? sum + columnWidths[i] : sum),
			0
		);

		// Non-frozen columns laid out consecutively after frozen-left area
		let x = frozenLeftTotal;
		for (let i = 0; i < columns.length; i++) {
			if (!columns[i].frozen) {
				positions[i] = x;
				x += columnWidths[i];
			}
		}

		// Frozen-left: pinned to viewport left edge
		for (let i = 0; i < columns.length; i++) {
			if (columns[i].frozen === 'left') {
				positions[i] = scrollLeft + frozenLeftOffsets[i];
			}
		}

		// Frozen-right: pinned to viewport right edge
		for (let i = 0; i < columns.length; i++) {
			if (columns[i].frozen === 'right') {
				positions[i] = scrollLeft + bodyClientWidth - frozenRightOffsets[i] - columnWidths[i];
			}
		}

		return positions;
	})();
	$: totalRows = rows.length;
	$: gridSpaceHeight = rowHeight * rows.length;
	$: visibleRowsIndexes = getVisibleRowsIndexes(
		rowHeight,
		scrollTop,
		rowsPerPage * rowHeight,
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
		if (rowHeight || headerRowHeight) {
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
		columnDropTarget = -1;
	};

	const swapColumns = (fromColumn: number, toColumn: number) => {
		const detail = swapGridColums(columns, fromColumn, toColumn);

		columns = [...detail.columns];
		dispatch('columnsSwapped', detail);
	};

	// eslint-disable-next-line no-undef
	const rowClick = (row: GridRow<T>) => {
		dispatch('rowClick', { row });
	};

	// eslint-disable-next-line no-undef
	const rowDblClick = (row: GridRow<T>) => {
		dispatch('rowDblClick', { row });
	};
</script>

<div
	bind:this={svelteGridWrapper}
	role="table"
	class="svelte-grid"
	style:--header-row-height="{headerRowHeight}px"
	style:--row-height="{rowHeight}px"
	style:--grid-space-width="{gridSpaceWidth}px"
	style:--grid-space-height="{gridSpaceHeight}px"
	style:--min-rows={rowsPerPage}
	class:resizing={isResizing || isDragging}
	class:isDragging
>
	<div class="svelte-grid-head" role="rowgroup">
		<div role="row" class="header-row" style:left="{scrollLeft * -1}px">
			{#each columns as column, i (i)}
				<div
					tabindex={i}
					data-testid="columnheader"
					class="columnheader grid-cell"
					title={column.label || ''}
					role="columnheader"
					style:width="{columnWidths[i]}px"
					style:left="{cellLeftPositions[i]}px"
					class:resizingColumn={isResizing && columnResizing == i}
					draggable={!isResizing && !column.frozen && (allColumnsDraggable || column.draggable)}
					class:draggable={!isResizing && !column.frozen && (allColumnsDraggable || column.draggable)}
					class:resizable={!isResizing && (allColumnsResizable || column.resizable)}
					class:dragging={isDragging && columnDragging == i}
					class:dropTarget={isDragging &&
						columnDropTarget === i &&
						columnDropTarget !== columnDragging}
					class:frozen-left={column.frozen === 'left'}
					class:frozen-right={column.frozen === 'right'}
					on:dragenter={() => {
						if (isDragging && !column.frozen && (allColumnsDraggable || column.draggable))
							columnDropTarget = i;
					}}
					on:dragover={(e) => {
						if (isDragging) e.preventDefault();
					}}
					animate:flip={isResizing || column.frozen ? NO_TRANSITION_EFFECT : animationParams}
					use:reziseColumn={{
						resizable: allColumnsResizable || column.resizable,
						startResize() {
							columnResizing = i;
							isResizing = true;
						},
						endResize() {
							columnResizing = -1;
							isResizing = false;
						},
						onResize(data) {
							if (data < MIN_COLUMN_WIDTH) return;

							columnWidths[i] = data;
						}
					}}
					use:dragAndDrop={{
						draggable: !column.frozen && (allColumnsDraggable || column.draggable),
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
									!columns[index].frozen &&
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

	<div role="rowgroup" class="svelte-grid-body" bind:this={gridBody} bind:clientWidth={bodyClientWidth} on:scroll={onScroll}>
		<div class="grid-space"></div>

		{#each visibleRows as row, virtualRowIndex}
			<div
				class="grid-row"
				style:top="{getRowTop(row.i, rowHeight)}px"
				role="row"
				aria-rowindex={row.i}
				tabindex={row.i}
				on:keydown={() => {}}
				on:click={() => rowClick(row)}
				on:dblclick={() => rowDblClick(row)}
			>
				{#each columns as column, j (j)}
					<div
						class="grid-cell"
						role="cell"
						data-column={j}
						data-row={row.i}
						style="width:{columnWidths[j]}px"
						style:left="{cellLeftPositions[j]}px"
						class:resizingColumn={isResizing && columnResizing == j}
						class:draggableColumnCell={allColumnsDraggable || column.draggable}
						class:frozen-left={column.frozen === 'left'}
						class:frozen-right={column.frozen === 'right'}
						animate:flip={isResizing || column.frozen ? NO_TRANSITION_EFFECT : animationParams}
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

	.columnheader.resizable:hover::after {
		content: '';
		cursor: ew-resize;
		position: absolute;
		top: 0;
		right: 0;
		width: 2px;
		height: 100%;
		z-index: 3;
	}

	.columnheader.draggable:not(.dragging):hover {
		content: '';
		position: absolute;
		background-color: var(--draggable-bg, rgba(33, 248, 255, 0.5));
		top: 0;
		right: 0;
		width: 100%;
		height: 100%;
		cursor: move;
	}

	.columnheader.dragging:hover {
		border: var(--border, 1px solid #666);
		background-color: var(--dragging-bg, rgba(33, 255, 151, 0.5));
	}
	.columnheader.dragging > * {
		opacity: 0.6;
	}

	.columnheader.dropTarget {
		background-color: var(--drop-target-bg, rgba(255, 140, 0, 0.5));
		border-left: 3px solid var(--drop-target-border, rgba(255, 140, 0, 0.9));
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
		width: auto;
		height: var(
			--grid-height,
			calc(
				var(--row-height) * var(--min-rows) + var(--header-row-height) + var(--header-border, 2px)
			)
		);
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
		height: var(--header-row-height);
		flex-direction: row;
		position: relative;
		top: 0;
	}

	.columnheader .cell-default {
		white-space: nowrap;
		font-weight: bold;
		text-align: center;
	}

	.svelte-grid-body {
		position: absolute;
		top: calc(var(--header-row-height) + var(--header-border, 2px));
		height: calc(100% - var(--header-row-height) - var(--header-border, 2px));
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

	.header-row .grid-cell {
		height: var(--header-row-height);
		line-height: var(--header-row-height);
	}

	.grid-cell:not(:last-child) {
		border-right: var(--border, 1px solid #666);
	}
	.grid-cell > * {
		height: 100%;
	}

	.grid-cell.resizingColumn {
		border-right: var(--border-resizing, 2px solid #666);
	}

	.grid-cell.frozen-left,
	.grid-cell.frozen-right {
		z-index: 5;
		background: var(--cell-bg, white);
	}

	.columnheader.frozen-left,
	.columnheader.frozen-right {
		z-index: 5;
		background: var(--head-bg, white);
	}

	.grid-cell.frozen-left,
	.columnheader.frozen-left {
		box-shadow: var(--frozen-left-shadow, 2px 0 4px rgba(0, 0, 0, 0.15));
	}

	.grid-cell.frozen-right,
	.columnheader.frozen-right {
		box-shadow: var(--frozen-right-shadow, -2px 0 4px rgba(0, 0, 0, 0.15));
	}
</style>
