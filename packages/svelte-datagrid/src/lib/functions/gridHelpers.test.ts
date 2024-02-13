import { describe, expect, it } from 'vitest';
import { swapGridColums } from './gridHelpers.js';
import type { GridColumn } from '$lib/types.js';

describe('swapGridColums', () => {
	it('should swap columns in the grid', () => {
		const columns = [
			{ label: 'Column 1' },
			{ label: 'Column 2' },
			{ label: 'Column 3' }
		] as GridColumn<unknown>[];
		const fromColumn = 0;
		const toColumn = 2;

		const result = swapGridColums(columns, fromColumn, toColumn);

		expect(result.columns[toColumn]).toEqual(columns[fromColumn]);
		expect(result.columns[fromColumn]).toEqual(columns[toColumn]);

		expect(result.from).toEqual(columns[fromColumn]);
		expect(result.to).toEqual(columns[toColumn]);
	});

	it('should keep original columns unchanged', () => {
		const columns = [
			{ label: 'Column 1' },
			{ label: 'Column 2' },
			{ label: 'Column 3' }
		] as GridColumn<unknown>[];

		const columnsCopy = [...columns];

		const fromColumn = 0;
		const toColumn = 2;

		swapGridColums(columns, fromColumn, toColumn);

		expect(columns).toEqual(columnsCopy);
	});
});
