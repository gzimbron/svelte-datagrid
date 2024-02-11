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
	totalRows: number;
	extraRows?: number;
	columns: GridColumn<T>[];
}

class GridState<T> {
	//columnWidths: number[];
	gridSpaceWidth: number;

	rowHeight: ReturnType<typeof createCustomState<number>>;
	scrollTop: ReturnType<typeof createCustomState<number>>;
	scrollLeft: ReturnType<typeof createCustomState<number>>;
	totalRows: ReturnType<typeof createCustomState<number>>;

	xPositions: ReturnType<typeof createCustomState<number[]>>;
	columnWidth: ReturnType<typeof createCustomState<number[]>>;

	visibleRowsIndexes: ReturnType<typeof createCustomState<{ start: number; end: number }>>;

	activeRow: ReturnType<typeof createCustomState<number>>;
	#extraRows: number;
	#affixedColumnsIndices: number[] = [];

	#wrapperHeight: number;
	#rowsInViewPort: number;

	constructor({ extraRows, columns, rowHeight, totalRows }: CreateStateProps<T>) {
		this.#wrapperHeight = 0;
		this.#rowsInViewPort = 0;

		this.#extraRows = extraRows || 0;
		this.totalRows = createCustomState(totalRows, () => {
			this.#recalculateRowsInViewPort();
			this.#updateVisibleRowsIndexes();
		});

		this.columnWidth = createCustomState<number[]>([]);
		this.xPositions = createCustomState<number[]>([]);

		this.recalculateColumnWidths(columns);

		this.gridSpaceWidth = columns.reduce((acc, { width }) => acc + width, 0);
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

		setTimeout(() => {
			this.#updateVisibleRowsIndexes();
		}, 0);
	}

	getCellZIndex = (columnIndex: number) => {
		return this.#affixedColumnsIndices.indexOf(columnIndex) == -1 ? 1 : 2;
	};

	getRowTop = (rowIndex: number) => {
		return rowIndex * get(this.rowHeight);
	};

	setNewScrollPositions = (newScrollTop: number, newScrollLeft: number) => {
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

	recalculateColumnWidths = (columns: GridColumn<T>[]) => {
		this.columnWidth.set(columns.map((column) => column.width || MIN_COLUMN_WIDTH));

		this.#updateXPositions();
	};

	#updateXPositions = () => {
		const columnWidths = get(this.columnWidth);
		this.xPositions.set(columnWidths.map((_, index) => this.#calculateXPosition(index)));
	};

	#calculateXPosition = (columnIndex: number) => {
		const columnWidths = get(this.columnWidth);

		if (this.#affixedColumnsIndices.indexOf(columnIndex) >= 0) {
			const actualScrollLeft = get(this.scrollLeft);

			if (columnIndex === 0) {
				return actualScrollLeft;
			}

			let left = actualScrollLeft;

			for (let j = columnIndex - 1; j >= 0; j--) {
				left += columnWidths[j];
			}

			return left;
		}

		let left = 0;
		for (let j = 0; j < columnIndex; j++) {
			left += columnWidths[j];
		}
		return left;
	};
}
