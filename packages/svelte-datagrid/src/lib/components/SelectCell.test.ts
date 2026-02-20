import type { GridColumn } from '$lib/types.js';
import { fireEvent, render } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SelectCell from './SelectCell.svelte';

interface Item {
	color: string;
}

const column: GridColumn<Item> = {
	label: 'Color',
	dataKey: 'color',
	width: 120,
	options: [
		{ value: 'red', label: 'Red' },
		{ value: 'green', label: 'Green' },
		{ value: 'blue', label: 'Blue' }
	]
};

describe('SelectCell', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('should render a select element', () => {
		const { container } = render(SelectCell<Item>, {
			row: { color: 'red' },
			column,
			rowIndex: 0,
			virtualRowIndex: 0
		});

		const select = container.querySelector('select');
		expect(select).not.toBeNull();
	});

	it('should render all options', () => {
		const { container } = render(SelectCell<Item>, {
			row: { color: 'red' },
			column,
			rowIndex: 0,
			virtualRowIndex: 0
		});

		const options = container.querySelectorAll('option');
		expect(options).toHaveLength(3);
	});

	it('should have the matching option selected', () => {
		const { container } = render(SelectCell<Item>, {
			row: { color: 'green' },
			column,
			rowIndex: 0,
			virtualRowIndex: 0
		});

		const options = container.querySelectorAll('option');
		const selectedOption = Array.from(options).find((o) => o.selected);
		expect(selectedOption?.value).toBe('green');
	});

	it('should not render select when options is not an array', () => {
		const columnNoOptions: GridColumn<Item> = { label: 'Color', dataKey: 'color', width: 120 };
		const { container } = render(SelectCell<Item>, {
			row: { color: 'red' },
			column: columnNoOptions,
			rowIndex: 0,
			virtualRowIndex: 0
		});

		const select = container.querySelector('select');
		expect(select).toBeNull();
	});

	it('should dispatch valueUpdated event when selection changes', async () => {
		const { component, container } = render(SelectCell<Item>, {
			row: { color: 'red' },
			column,
			rowIndex: 1,
			virtualRowIndex: 1
		});

		const handler = vi.fn();
		component.$on('valueUpdated', handler);

		const select = container.querySelector('select') as HTMLSelectElement;
		await fireEvent.change(select, { target: { value: 'blue' } });

		expect(handler).toHaveBeenCalledOnce();
		const event = handler.mock.calls[0][0] as CustomEvent;
		expect(event.detail.rowIndex).toBe(1);
		expect(event.detail.column).toEqual(column);
	});

	it('should render label from function option', () => {
		const columnWithFnLabel: GridColumn<Item> = {
			label: 'Color',
			dataKey: 'color',
			width: 120,
			options: [{ value: 'red', label: () => 'Dynamic Red' }]
		};

		const { container } = render(SelectCell<Item>, {
			row: { color: 'red' },
			column: columnWithFnLabel,
			rowIndex: 0,
			virtualRowIndex: 0
		});

		const option = container.querySelector('option');
		expect(option?.textContent?.trim()).toBe('Dynamic Red');
	});

	it('should set correct id on select', () => {
		const { container } = render(SelectCell<Item>, {
			row: { color: 'red' },
			column,
			rowIndex: 4,
			virtualRowIndex: 4
		});

		const select = container.querySelector('select');
		expect(select?.id).toBe('grid-data-row-4-color');
	});
});
