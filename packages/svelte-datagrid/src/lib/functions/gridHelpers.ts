import type { GridColumn } from '$lib/types.js';

export function swapGridColums<T>(columns: GridColumn<T>[], fromColumn: number, toColumn: number) {
	const from = columns[fromColumn];
	const to = columns[toColumn];
	columns[fromColumn] = to;
	columns[toColumn] = from;

	columns = [...columns];

	return { from, to, columns };
}
