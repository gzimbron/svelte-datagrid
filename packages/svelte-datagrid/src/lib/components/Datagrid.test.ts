import { calculateDefaultRowsPerPage } from '$lib/functions/calculateFunctions.js';
import type { GridColumn } from '$lib/types.js';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it } from 'vitest';
import Datagrid from './Datagrid.svelte';

interface Cat {
	name: string;
	age: number;
	color: string;
}
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

const draggableColumns: GridColumn<Cat>[] = columns.map((c) => ({ ...c, draggable: true }));

describe('Datagrid', () => {
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

	it(`should update visibleRowsIndexes when scroll top by 200`, async () => {
		const { component } = render(Datagrid<Cat>, {
			columns,
			rows: [...rows, ...rows, ...rows, ...rows, ...rows],
			rowsPerPage: 3
		});

		const dataGridBody = (await screen.findAllByRole('rowgroup'))[1];

		await fireEvent.scroll(dataGridBody, { target: { scrollTop: 200 } });

		const { visibleRowsIndexes } = component.getGridState();

		expect(visibleRowsIndexes.start).toBe(8);
		expect(visibleRowsIndexes.end).toBe(12);
	});
});

describe('Datagrid frozen columns', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('should add frozen-left class to frozen left column headers', async () => {
		const frozenColumns: GridColumn<Cat>[] = [
			{ ...columns[0], frozen: 'left' },
			columns[1],
			columns[2]
		];
		const { findAllByTestId } = render(Datagrid<Cat>, { columns: frozenColumns, rows });

		const headers = await findAllByTestId('columnheader');
		expect(headers[0].classList.contains('frozen-left')).toBe(true);
		expect(headers[1].classList.contains('frozen-left')).toBe(false);
		expect(headers[2].classList.contains('frozen-left')).toBe(false);
	});

	it('should add frozen-right class to frozen right column headers', async () => {
		const frozenColumns: GridColumn<Cat>[] = [
			columns[0],
			columns[1],
			{ ...columns[2], frozen: 'right' }
		];
		const { findAllByTestId } = render(Datagrid<Cat>, { columns: frozenColumns, rows });

		const headers = await findAllByTestId('columnheader');
		expect(headers[2].classList.contains('frozen-right')).toBe(true);
		expect(headers[0].classList.contains('frozen-right')).toBe(false);
	});

	it('should not make frozen columns draggable', async () => {
		const frozenColumns: GridColumn<Cat>[] = [
			{ ...columns[0], frozen: 'left', draggable: true },
			{ ...columns[1], draggable: true },
			{ ...columns[2], frozen: 'right', draggable: true }
		];
		const { findAllByTestId } = render(Datagrid<Cat>, { columns: frozenColumns, rows });

		const headers = await findAllByTestId('columnheader');
		expect(headers[0].classList.contains('draggable')).toBe(false);
		expect(headers[1].classList.contains('draggable')).toBe(true);
		expect(headers[2].classList.contains('draggable')).toBe(false);
	});

	it('should not set frozen columns as drop targets during drag', async () => {
		const frozenColumns: GridColumn<Cat>[] = [
			{ ...columns[0], frozen: 'left' },
			{ ...columns[1], draggable: true },
			{ ...columns[2], draggable: true }
		];
		const { findAllByTestId } = render(Datagrid<Cat>, { columns: frozenColumns, rows });

		const headers = await findAllByTestId('columnheader');
		const [frozen, , source] = headers;

		await fireEvent.dragStart(source);
		await fireEvent.dragEnter(frozen);

		expect(frozen.classList.contains('dropTarget')).toBe(false);
	});
});

describe('Datagrid column drag drop target', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('should add dropTarget class to hovered column during drag', async () => {
		const { findAllByTestId } = render(Datagrid<Cat>, { columns: draggableColumns, rows });

		const headers = await findAllByTestId('columnheader');
		const [source, target] = headers;

		await fireEvent.dragStart(source);
		await fireEvent.dragEnter(target);

		expect(target.classList.contains('dropTarget')).toBe(true);
	});

	it('should not add dropTarget class to the column being dragged', async () => {
		const { findAllByTestId } = render(Datagrid<Cat>, { columns: draggableColumns, rows });

		const headers = await findAllByTestId('columnheader');
		const [source] = headers;

		await fireEvent.dragStart(source);
		await fireEvent.dragEnter(source);

		expect(source.classList.contains('dropTarget')).toBe(false);
	});

	it('should not add dropTarget class to non-draggable columns', async () => {
		const mixedColumns: GridColumn<Cat>[] = [
			{ ...columns[0], draggable: true },
			{ ...columns[1], draggable: false },
			{ ...columns[2], draggable: true }
		];
		const { findAllByTestId } = render(Datagrid<Cat>, { columns: mixedColumns, rows });

		const headers = await findAllByTestId('columnheader');
		const [source, nonDraggable] = headers;

		await fireEvent.dragStart(source);
		await fireEvent.dragEnter(nonDraggable);

		expect(nonDraggable.classList.contains('dropTarget')).toBe(false);
	});

	it('should remove dropTarget class after drag ends', async () => {
		const { findAllByTestId } = render(Datagrid<Cat>, { columns: draggableColumns, rows });

		const headers = await findAllByTestId('columnheader');
		const [source, target] = headers;

		await fireEvent.dragStart(source);
		await fireEvent.dragEnter(target);
		expect(target.classList.contains('dropTarget')).toBe(true);

		await fireEvent.dragEnd(source);
		expect(target.classList.contains('dropTarget')).toBe(false);
	});

	it('should update dropTarget class when hovering a different column', async () => {
		const { findAllByTestId } = render(Datagrid<Cat>, { columns: draggableColumns, rows });

		const [source, second, third] = await findAllByTestId('columnheader');

		await fireEvent.dragStart(source);
		await fireEvent.dragEnter(second);
		expect(second.classList.contains('dropTarget')).toBe(true);

		await fireEvent.dragEnter(third);
		expect(third.classList.contains('dropTarget')).toBe(true);
		expect(second.classList.contains('dropTarget')).toBe(false);
	});

	it('should work with allColumnsDraggable prop', async () => {
		const { findAllByTestId } = render(Datagrid<Cat>, {
			columns,
			rows,
			allColumnsDraggable: true
		});

		const [source, target] = await findAllByTestId('columnheader');

		await fireEvent.dragStart(source);
		await fireEvent.dragEnter(target);

		expect(target.classList.contains('dropTarget')).toBe(true);
	});
});
