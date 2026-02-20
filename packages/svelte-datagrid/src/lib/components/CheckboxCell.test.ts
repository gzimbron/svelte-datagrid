import type { GridColumn } from '$lib/types.js';
import { fireEvent, render } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CheckboxCell from './CheckboxCell.svelte';

interface Item {
	active: boolean;
}

const column: GridColumn<Item> = {
	label: 'Active',
	dataKey: 'active',
	width: 80
};

describe('CheckboxCell', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('should render a checkbox input', () => {
		const { container } = render(CheckboxCell<Item>, {
			row: { active: true },
			column,
			rowIndex: 0,
			virtualRowIndex: 0
		});

		const input = container.querySelector('input[type="checkbox"]');
		expect(input).not.toBeNull();
	});

	it('should render checked when row value is true', () => {
		const { container } = render(CheckboxCell<Item>, {
			row: { active: true },
			column,
			rowIndex: 0,
			virtualRowIndex: 0
		});

		const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
		expect(input.checked).toBe(true);
	});

	it('should render unchecked when row value is false', () => {
		const { container } = render(CheckboxCell<Item>, {
			row: { active: false },
			column,
			rowIndex: 0,
			virtualRowIndex: 0
		});

		const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
		expect(input.checked).toBe(false);
	});

	it('should dispatch valueUpdated event when clicked', async () => {
		const { component, container } = render(CheckboxCell<Item>, {
			row: { active: false },
			column,
			rowIndex: 2,
			virtualRowIndex: 2
		});

		const handler = vi.fn();
		component.$on('valueUpdated', handler);

		const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
		await fireEvent.click(input);

		expect(handler).toHaveBeenCalledOnce();
		const event = handler.mock.calls[0][0] as CustomEvent;
		expect(event.detail.rowIndex).toBe(2);
		expect(event.detail.virtualRowIndex).toBe(2);
		expect(event.detail.column).toEqual(column);
	});

	it('should set correct id on input', () => {
		const { container } = render(CheckboxCell<Item>, {
			row: { active: true },
			column,
			rowIndex: 3,
			virtualRowIndex: 3
		});

		const input = container.querySelector('input');
		expect(input?.id).toBe('grid-data-row-3-active');
	});
});
