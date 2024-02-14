export interface GridProps {
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
	/**
	 * Min height for the grid container
	 * @default RowHeight * 6
	 */
	'--grid-height'?: string;
}
