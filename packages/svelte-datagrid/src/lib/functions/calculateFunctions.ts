import { MAX_DEFAULT_ROWS_PER_PAGE } from '$lib/configurations.js';
import type { GridColumn } from '$lib/types.js';

export const MIN_COLUMN_WIDTH = 20;

export function updateColumnWidths<T>(columns: GridColumn<T>[]) {
	return columns.map((column) => column.width || MIN_COLUMN_WIDTH);
}

export function calculateXPositions(columnWidths: number[]) {
	const xPositions = [0];
	let x = 0;
	for (let i = 0; i < columnWidths.length - 1; i++) {
		x += columnWidths[i];
		xPositions.push(x);
	}
	return xPositions;
}

export function calculateGridSpaceWidth(columnWidths: number[]) {
	return columnWidths.reduce((acc, width) => acc + width, 0);
}

/**
 * Returns an array where each index contains the cumulative width of all
 * preceding frozen-left columns (i.e. the sticky left offset for that column).
 * Non-frozen columns get 0.
 */
export function calculateFrozenLeftOffsets<T>(
	columns: GridColumn<T>[],
	columnWidths: number[]
): number[] {
	const offsets: number[] = new Array(columns.length).fill(0);
	let currentOffset = 0;
	for (let i = 0; i < columns.length; i++) {
		if (columns[i].frozen === 'left') {
			offsets[i] = currentOffset;
			currentOffset += columnWidths[i];
		}
	}
	return offsets;
}

/**
 * Returns an array where each index contains the cumulative width of all
 * following frozen-right columns (i.e. the sticky right offset for that column).
 * Non-frozen columns get 0.
 */
export function calculateFrozenRightOffsets<T>(
	columns: GridColumn<T>[],
	columnWidths: number[]
): number[] {
	const offsets: number[] = new Array(columns.length).fill(0);
	let currentOffset = 0;
	for (let i = columns.length - 1; i >= 0; i--) {
		if (columns[i].frozen === 'right') {
			offsets[i] = currentOffset;
			currentOffset += columnWidths[i];
		}
	}
	return offsets;
}

export function getVisibleRowsIndexes(
	rowHeight: number,
	scrollTop: number,
	wrapperHeight: number,
	totalRows: number,
	extraRows: number
) {
	//console.log({ rowHeight, scrollTop, wrapperHeight, totalRows, extraRows });
	let start = Math.floor(scrollTop / rowHeight);

	if (start < 0) start = 0;

	const end = Math.min(Math.ceil((scrollTop + wrapperHeight) / rowHeight) + extraRows, totalRows);
	return { start, end };
}

export function getRowTop(rowIndex: number, rowHeight: number) {
	return rowIndex * rowHeight;
}

export function calculatePercent(actual: number, total: number) {
	return Math.round((actual / total) * 100);
}

export function calculateDefaultRowsPerPage(rowsLength: number) {
	return rowsLength > MAX_DEFAULT_ROWS_PER_PAGE ? MAX_DEFAULT_ROWS_PER_PAGE : rowsLength;
}
