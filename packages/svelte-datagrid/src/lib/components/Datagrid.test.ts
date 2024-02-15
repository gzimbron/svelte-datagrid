import type { GridColumn } from '$lib/types.js';
import { render } from '@testing-library/svelte';
import { beforeEach, describe, expect, it } from 'vitest';
import Datagrid from './Datagrid.svelte';
import { calculateDefaultRowsPerPage } from '$lib/functions/calculateFunctions.js';

interface Cat {
	name: string;
	age: number;
	color: string;
}

describe('Datagrid', () => {
	const columns: GridColumn<Cat>[] = [
		{
			label: 'Name',
			dataKey: 'name',
			width: 120
		},
		{
			label: 'Age',
			dataKey: 'age',
			width: 80
		},
		{
			label: 'Color',
			dataKey: 'color',
			width: 120
		}
	];

	const rows: Cat[] = [
		{ name: 'Fluffy', age: 2, color: 'black' },
		{ name: 'Whiskers', age: 3, color: 'white' },
		{ name: 'Felix', age: 1, color: 'orange' }
	];

	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('should render component', async () => {
		const { container } = render(Datagrid<Cat>, { columns, rows });

		expect(container.firstChild).not.toBeNull();
	});

	it('should render 3 column headers', async () => {
		const { findAllByTestId } = render(Datagrid<Cat>, { columns, rows });

		const columnHeaders = await findAllByTestId('columnheader');

		expect(columnHeaders).toHaveLength(3);
	});

	it('should fail if no columns are provided', async () => {
		expect(() => render(Datagrid<Cat>, { rows, columns: [] })).toThrow();
	});

	it('should fail if no rows are provided', async () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(() => render(Datagrid<Cat>, { columns } as any)).toThrow();
	});

	it('should render if empty rows array is provided', async () => {
		const { container } = render(Datagrid<Cat>, { columns, rows: [] });

		expect(container.firstChild).not.toBeNull();
	});

	it(`should render default rows in viewport`, async () => {
		const defaultNumRows = calculateDefaultRowsPerPage(rows.length);

		const { findAllByRole } = render(Datagrid<Cat>, { columns, rows });

		let rowsResult = await findAllByRole('row');

		rowsResult = rowsResult.filter((row) => !row.classList.contains('header-row'));

		expect(rowsResult).toHaveLength(defaultNumRows);
	});
});
