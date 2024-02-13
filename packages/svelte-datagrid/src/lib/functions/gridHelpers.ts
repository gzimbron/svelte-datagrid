import type { GridColumn } from '$lib/types.js';

export function swapGridColums<T>(columns: GridColumn<T>[], fromColumn: number, toColumn: number) {
	const columnsCopy = [...columns];
	const from = columnsCopy[fromColumn];
	const to = columnsCopy[toColumn];
	columnsCopy[fromColumn] = to;
	columnsCopy[toColumn] = from;

	return { from, to, columns: [...columnsCopy] };
}
