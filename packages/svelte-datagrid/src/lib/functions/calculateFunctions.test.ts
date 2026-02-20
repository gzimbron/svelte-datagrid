import { describe, expect, it } from 'vitest';
import {
	MIN_COLUMN_WIDTH,
	calculateDefaultRowsPerPage,
	calculateGridSpaceWidth,
	calculatePercent,
	calculateXPositions,
	getRowTop,
	getVisibleRowsIndexes,
	updateColumnWidths
} from './calculateFunctions.js';
import { MAX_DEFAULT_ROWS_PER_PAGE } from '$lib/configurations.js';
import type { GridColumn } from '$lib/types.js';

describe('updateColumnWidths', () => {
	it('should return an array of column widths', () => {
		const columns = [
			{ width: 100 },
			{ width: 200 },
			{ width: 150 },
			{ width: undefined }
		] as GridColumn<unknown>[];

		const expected = [100, 200, 150, MIN_COLUMN_WIDTH];
		const result = updateColumnWidths(columns);

		expect(result).toEqual(expected);
	});

	it('should return an array of default column widths if no width is provided', () => {
		const columns = [{}, {}, {}] as GridColumn<unknown>[];

		const expected = [MIN_COLUMN_WIDTH, MIN_COLUMN_WIDTH, MIN_COLUMN_WIDTH];
		const result = updateColumnWidths(columns);

		expect(result).toEqual(expected);
	});
});

describe('calculateXPositions', () => {
	const widthColumns = [100, 200, 150, 100];

	it('should return an array of x positions', () => {
		const expected = [0, 100, 300, 450];
		const result = calculateXPositions(widthColumns);

		expect(result).toEqual(expected);
	});

	it('should return the number of columns', () => {
		const expected = widthColumns.length;
		const result = calculateXPositions(widthColumns).length;

		expect(result).toEqual(expected);
	});
});

describe('calculateGridSpaceWidth', () => {
	const widthColumns = [100, 200, 150, 100];
	it('should return the sum of the column widths', () => {
		const expected = 550;
		const result = calculateGridSpaceWidth(widthColumns);

		expect(result).toEqual(expected);
	});

	it('should return a value greater than 0', () => {
		const result = calculateGridSpaceWidth(widthColumns);
		expect(result).toBeGreaterThan(0);
	});
});

describe('getVisibleRowsIndexes', () => {
	it('should return the start and end indexes of the visible rows', () => {
		const rowHeight = 20;
		const scrollTop = 40;
		const wrapperHeight = 100;
		const totalRows = 100;
		const extraRows = 10;

		const expected = { start: 2, end: 17 };
		const result = getVisibleRowsIndexes(rowHeight, scrollTop, wrapperHeight, totalRows, extraRows);

		expect(result).toEqual(expected);
	});

	it('should return the start and end indexes of the visible rows when scrollTop is 0 no extra rows', () => {
		const rowHeight = 20;
		const scrollTop = 0;
		const wrapperHeight = 100;
		const totalRows = 100;
		const extraRows = 0;

		const expected = { start: 0, end: 5 };
		const result = getVisibleRowsIndexes(rowHeight, scrollTop, wrapperHeight, totalRows, extraRows);

		expect(result).toEqual(expected);
	});

	it('should clamp start to 0 when scrollTop is negative', () => {
		const result = getVisibleRowsIndexes(20, -100, 100, 100, 0);

		expect(result.start).toBe(0);
	});

	it('should clamp end to totalRows when visible rows exceed total', () => {
		const result = getVisibleRowsIndexes(20, 0, 1000, 5, 0);

		expect(result.end).toBe(5);
	});
});

describe('getRowTop', () => {
	it('should return the top position of the row', () => {
		const rowHeight = 20;
		const rowIndex = 5;

		const expected = 100;
		const result = getRowTop(rowIndex, rowHeight);

		expect(result).toEqual(expected);
	});
});

describe('calculateDefaultRowsPerPage', () => {
	it('should return rowsLength when less than MAX_DEFAULT_ROWS_PER_PAGE', () => {
		const result = calculateDefaultRowsPerPage(5);

		expect(result).toBe(5);
	});

	it('should return MAX_DEFAULT_ROWS_PER_PAGE when rowsLength exceeds it', () => {
		const result = calculateDefaultRowsPerPage(MAX_DEFAULT_ROWS_PER_PAGE + 1);

		expect(result).toBe(MAX_DEFAULT_ROWS_PER_PAGE);
	});

	it('should return MAX_DEFAULT_ROWS_PER_PAGE when rowsLength equals it', () => {
		const result = calculateDefaultRowsPerPage(MAX_DEFAULT_ROWS_PER_PAGE);

		expect(result).toBe(MAX_DEFAULT_ROWS_PER_PAGE);
	});
});

describe('calculatePercent', () => {
	it('should return the percentage of 23/100 items', () => {
		const actual = 23;
		const total = 110;

		const expected = 21;
		const result = calculatePercent(actual, total);

		expect(result).toEqual(expected);
	});

	it('should return the percentage of 0/100 items', () => {
		const actual = 0;
		const total = 100;

		const expected = 0;
		const result = calculatePercent(actual, total);

		expect(result).toEqual(expected);
	});

	it('should return the percentage of 100/100 items', () => {
		const actual = 100;
		const total = 100;

		const expected = 100;
		const result = calculatePercent(actual, total);

		expect(result).toEqual(expected);
	});

	it('should return the percentage of 50/100 items', () => {
		const actual = 50;
		const total = 100;

		const expected = 50;
		const result = calculatePercent(actual, total);

		expect(result).toEqual(expected);
	});
});
