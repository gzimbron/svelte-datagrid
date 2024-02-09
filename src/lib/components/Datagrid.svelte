<script lang="ts" generics="T">
	import { createGridState } from '$lib/state/grid.state.js';
	import type {
		CustomCellComponentEvents,
		GridCellUpdated,
		GridColumn,
		GridProps,
		GridRow
	} from '$lib/types.js';
	import { beforeUpdate, createEventDispatcher } from 'svelte';

	// eslint-disable-next-line no-undef, @typescript-eslint/no-unused-vars
	interface $$Props extends GridProps<T> {}

	// eslint-disable-next-line no-undef
	type ComponentEventsList = CustomCellComponentEvents<T> & {
		scroll: number;
	};
	const dispatch = createEventDispatcher<ComponentEventsList>();

	const MIN_ROW_HEIGHT = 20;

	// eslint-disable-next-line no-undef
	export let columns: GridColumn<T>[];
	// eslint-disable-next-line no-undef
	export let rows: T[];
	export let rowHeight = 30;
	export let extraRows = 0;

	let wrapper: HTMLDivElement;
	let gridBody: HTMLDivElement;
	let isResizing = false;
	let columnDragging = false;
	let gridHeight = 0;
	// eslint-disable-next-line no-undef
	let visibleRows: GridRow<T>[];
	let scrolledPercent = 0;

	let {
		columnWidths,
		gridSpaceWidth,
		scrollTop,
		scrollLeft,
		visibleRowsIndexes,
		getCellLeft,
		getRowTop,
		getCellZIndex,
		setNewScrollPositions,
		setGridHeight,
		totalRows,
		rowHeight: gridRowHeight
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
</script>

<div
	bind:this={wrapper}
	bind:offsetHeight={gridHeight}
	role="table"
	class="svelte-grid"
	style:--row-height="{$gridRowHeight}px"
	style:--grid-space-width="{gridSpaceWidth}px"
	style:--grid-space-height="{gridSpaceHeight}px"
	style:--top-scroll="{$scrollTop}px"
	style:--left-scroll="{$scrollLeft}px"
	class:resizing={isResizing || columnDragging}
>
	<div class="svelte-grid-head" role="rowgroup">
		<div role="row" class="header-row">
			{#each columns as column, i (i)}
				<div
					tabindex={i}
					class="grid-cell"
					title={column.label || ''}
					role="columnheader"
					style:z-index={getCellZIndex(i)}
					style:left="{getCellLeft(i)}px"
					style:width="{columnWidths[i]}px"
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
				{#each columns as column, j}
					<div
						class="grid-cell"
						role="cell"
						style="width:{columnWidths[j]}px"
						style:z-index={getCellZIndex(j)}
						style:left="{getCellLeft(j)}px"
					>
						<div class="cell-container" class:cell-default={!column.cellComponent}>
							{#if column.cellComponent}
								<svelte:component
									this={column.cellComponent}
									rowIndex={row.i}
									{column}
									row={row.data}
									on:valueUpdated={valueUpdated}
									on:valueUpdated
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
		overflow: hidden;
		position: relative;
		top: 0;
		left: calc(var(--left-scroll) * -1);
	}

	.header-row .cell-default {
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
