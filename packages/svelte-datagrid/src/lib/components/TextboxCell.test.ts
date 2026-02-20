import type { GridColumn } from '$lib/types.js';
import { fireEvent, render } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { writable } from 'svelte/store';
import TextboxCell from './TextboxCell.svelte';

interface Item {
	name: string;
}

const column: GridColumn<Item> = {
	label: 'Name',
	dataKey: 'name',
	width: 120
};

function renderTextboxCell(props: {
	row: Item;
	column: GridColumn<Item>;
	rowIndex: number;
	virtualRowIndex: number;
}) {
	const activeRow = writable(-1);
	return render(TextboxCell<Item>, {
		props,
		context: new Map([['activeRow', activeRow]])
	});
}

describe('TextboxCell', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('should render a text input', () => {
		const { container } = renderTextboxCell({
			row: { name: 'Alice' },
			column,
			rowIndex: 0,
			virtualRowIndex: 0
		});

		const input = container.querySelector('input[type="text"]');
		expect(input).not.toBeNull();
	});

	it('should set correct id on input', () => {
		const { container } = renderTextboxCell({
			row: { name: 'Alice' },
			column,
			rowIndex: 5,
			virtualRowIndex: 5
		});

		const input = container.querySelector('input');
		expect(input?.id).toBe('grid-data-row-5-name');
	});

	it('should dispatch valueUpdated event on input', async () => {
		const { component, container } = renderTextboxCell({
			row: { name: 'Alice' },
			column,
			rowIndex: 0,
			virtualRowIndex: 0
		});

		const handler = vi.fn();
		component.$on('valueUpdated', handler);

		const input = container.querySelector('input') as HTMLInputElement;
		input.value = 'Bob';
		await fireEvent.input(input);

		await new Promise((r) => setTimeout(r, 10));

		expect(handler).toHaveBeenCalledOnce();
		const event = handler.mock.calls[0][0] as CustomEvent;
		expect(event.detail.value).toBe('Bob');
		expect(event.detail.rowIndex).toBe(0);
		expect(event.detail.column).toEqual(column);
	});
});
