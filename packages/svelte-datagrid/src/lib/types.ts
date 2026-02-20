import type { ComponentType, SvelteComponent } from 'svelte';

type StringKeys<T> = Extract<keyof T, string>;

export type GridColumn<T> = {
	label: string;
	dataKey: StringKeys<T>;
	width: number;
	headerComponent?: CustomHeaderComponent<T>;
	cellComponent?: CustomCellComponent<T>;
	options?: GridColumnOption[];
	draggable?: boolean;
	resizable?: boolean;
	/**
	 * Freeze the column to the left or right side of the grid.
	 * Frozen columns remain visible during horizontal scroll.
	 */
	frozen?: 'left' | 'right';
};

export type GridColumnOption = {
	value: string;
	label: string | (() => string);
};

export type GridRow<T> = {
	data: T;
	i: number;
};

export type GridCellUpdated<T> = {
	row: T;
	column: GridColumn<T>;
	value: unknown;
	rowIndex: number;
	virtualRowIndex: number;
};

interface CustomHeaderComponentProps<T> {
	column: GridColumn<T>;
}

interface CustomCellComponentProps<T> {
	rowIndex: number;
	virtualRowIndex: number;
	column: GridColumn<T>;
	row: T;
}

type CustomCellComponentEvents<T> = {
	/**
	 * Event triggered when the value of a cell is updated by the user
	 */
	valueUpdated: CustomEvent<GridCellUpdated<T>>;
};

type CustomCellComponent<T> = ComponentType<
	SvelteComponent<CustomCellComponentProps<T>, CustomCellComponentEvents<T>>
>;

type CustomHeaderComponent<T> = ComponentType<SvelteComponent<CustomHeaderComponentProps<T>>>;
