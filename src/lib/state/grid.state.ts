import type { GridColumn } from '$lib/types.js';
import { getContext, hasContext, setContext } from 'svelte';
import { get } from 'svelte/store';
import { createCustomState } from './custom.state.js';

const CONTEXT_KEY = 'gr1d5t4t3';
const MIN_COLUMN_WIDTH = 30;

export const createGridState = <T>(props: CreateStateProps<T>): GridState<T> => {
	return setContext(CONTEXT_KEY, new GridState(props));
};

export const getGridState = <T>(): GridState<T> => {
	if (!hasContext(CONTEXT_KEY)) {
		throw new Error('No existe un contexto de baseOptionState');
	}

	return getContext(CONTEXT_KEY);
};

interface CreateStateProps<T> {
	rowHeight: number;
	extraRows?: number;
	columns: GridColumn<T>[];
}

class GridState<T> {
	columnWidths: number[];
	gridSpaceWidth: number;

	rowHeight: ReturnType<typeof createCustomState<number>>;
	scrollTop: ReturnType<typeof createCustomState<number>>;
	scrollLeft: ReturnType<typeof createCustomState<number>>;
	resizing: ReturnType<typeof createCustomState<boolean>>;
	columnDragging: ReturnType<typeof createCustomState<boolean>>;
	visibleRowsIndexes: ReturnType<typeof createCustomState<{ start: number; end: number }>>;

	activeRow: ReturnType<typeof createCustomState<number>>;
	#extraRows: number;
	#affixedColumnsIndices: number[] = [];

	#wrapperHeight: number;
	#rowsInViewPort: number;

	constructor({ extraRows, columns, rowHeight }: CreateStateProps<T>) {
		this.#wrapperHeight = 0;
		this.#rowsInViewPort = 0;

		this.#extraRows = extraRows || 0;
		this.columnWidths = columns.map((column) => column.width || MIN_COLUMN_WIDTH);
		this.gridSpaceWidth = this.columnWidths.reduce((acc, width) => acc + width, 0);
		this.rowHeight = createCustomState(rowHeight, () => {
			this.#recalculateRowsInViewPort();
			this.#updateVisibleRowsIndexes();
		});

		this.activeRow = createCustomState(-1);

		this.visibleRowsIndexes = createCustomState({
			start: 0,
			end: 0
		});

		this.scrollTop = createCustomState(0);
		this.scrollLeft = createCustomState(0);
		this.resizing = createCustomState(false);
		this.columnDragging = createCustomState(false);

		setTimeout(() => {
			this.#updateVisibleRowsIndexes();
		}, 0);
	}

	getCellLeft = (columnIndex: number) => {
		if (this.#affixedColumnsIndices.indexOf(columnIndex) >= 0) {
			const actualScrollLeft = get(this.scrollLeft);

			if (columnIndex === 0) {
				return actualScrollLeft;
			}

			let left = actualScrollLeft;

			for (let j = columnIndex - 1; j >= 0; j--) {
				left += this.columnWidths[j];
			}

			return left;
		}

		let left = 0;
		for (let j = 0; j < columnIndex; j++) {
			left += this.columnWidths[j];
		}
		return left;
	};

	getCellZIndex = (columnIndex: number) => {
		return this.#affixedColumnsIndices.indexOf(columnIndex) == -1 ? 1 : 2;
	};

	getRowTop = (rowIndex: number) => {
		return rowIndex * get(this.rowHeight);
	};

	onGridScrolled = (currentTarget: HTMLDivElement) => {
		if (!currentTarget) {
			console.log('no hay tablesapce');
			return;
		}

		const { scrollTop: newScrollTop, scrollLeft: newScrollLeft } = currentTarget;

		const actualScrollTop = get(this.scrollTop);
		const actualScrollLeft = get(this.scrollLeft);

		if (actualScrollTop !== newScrollTop) {
			this.scrollTop.set(newScrollTop);
		}

		if (actualScrollLeft !== newScrollLeft) {
			this.scrollLeft.set(newScrollLeft);
		}

		this.#updateVisibleRowsIndexes();
	};

	#updateVisibleRowsIndexes = () => {
		const start = Math.max(
			0,
			Math.floor(get(this.scrollTop) / get(this.rowHeight) - this.#extraRows / 2)
		);
		const end = start + this.#rowsInViewPort + this.#extraRows;

		this.visibleRowsIndexes.set({ start, end });
	};

	#recalculateRowsInViewPort = () => {
		this.#rowsInViewPort = Math.ceil(this.#wrapperHeight / get(this.rowHeight));
	};

	setGridHeight = (wrapperHeight: number) => {
		if (wrapperHeight === this.#wrapperHeight) return;
		try {
			this.#wrapperHeight = wrapperHeight;
			this.#recalculateRowsInViewPort();
			setTimeout(() => {
				this.#updateVisibleRowsIndexes();
			}, 0);
		} catch (error) {
			console.log('error', wrapperHeight);
		}
	};
}
