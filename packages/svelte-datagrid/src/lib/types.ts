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
};

interface CustomHeaderComponentProps<T> {
	column: GridColumn<T>;
}

interface CustomCellComponentProps<T> {
	rowIndex: number;
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

export interface GridProps<T> {
	/**
	 * The columns of the grid
	 */
	columns: GridColumn<T>[];
	/**
	 * The rows of the grid
	 */
	rows: T[];
	/**
	 * The height of the grid rows in pixels
	 */
	rowHeight?: number;
	/**
	 * Slice of extra rows to render outside the viewport
	 */
	extraRows?: number;

	/**
	 * Set all columns draggable by default, ignoring the `draggable` property of each column
	 */
	allColumnsDraggable?: boolean;

	/**
	 * Css: Custom style for grid borders:
	 * @default '1px solid #666'
	 */
	'--border'?: string;
	/**
	 * Custom width for header row border bottom
	 * @default '2px'
	 */
	'--header-border'?: string;
	/**
	 * Custom color for header row border bottom
	 * @default 'black'
	 */
	'--header-border-color'?: string;
	/**
	 * Custom background color for header row
	 * @default 'white'
	 */
	'--head-bg'?: string;
	/**
	 * Custom background color for body cells
	 * @default 'white'
	 */
	'--cell-bg'?: string;
	/**
	 * Custom background color for textbox cells
	 * @default 'white'
	 */
	'--textbox-cell-bg'?: string;
	/**
	 * Custom background color for select cells
	 * @default 'white'
	 */
	'--select-cell-bg'?: string;
	/**
	 * Custom color for header row text
	 */
	'--head-color'?: string;
	/**
	 * Custom color for body cells text
	 */
	'--cell-color'?: string;
	/**
	 * Custom color for textbox cells text
	 */
	'--textbox-cell-color'?: string;
	/**
	 * Custom color for select cells text
	 */
	'--select-cell-color'?: string;
	/**
	 * Opacity for NOT draggable columns content when dragging.
	 * @default '0.4'
	 */
	'--no-draggable-opacity'?: string;
	/**
	 * CSS color for NOT draggable columns when dragging, this color is used to create an overlay over the column
	 * @default 'rgba(66, 66, 66, 0.5)'
	 */
	'--no-draggable-fg'?: string;
	/**
	 * CSS Hover color for draggable columns.
	 * @default 'rgba(33, 248, 255, 0.5)'
	 */
	'--draggable-bg'?: string;
	/**
	 * CSS Background color for actual dragging column.
	 * @default 'rgba(33, 255, 151, 0.5)'
	 */
	'--dragging-bg'?: string;
}
