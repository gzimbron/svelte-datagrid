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
