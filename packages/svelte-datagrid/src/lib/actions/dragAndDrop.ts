import type { Action } from 'svelte/action';

interface ActionParams {
	draggable?: boolean;
	dropzone?: boolean;
	dragStart?: (e: DragEvent) => void;
	dragEnd?: (e: DragEvent) => void;
}

export const dragAndDrop: Action<HTMLElement, ActionParams> = (
	node,
	{ draggable, dragEnd, dragStart }: ActionParams = {}
) => {
	if (draggable) {
		node.draggable = true;

		node.addEventListener('dragstart', (e) => {
			dragStart && dragStart(e);
			node.classList.add('dragging');
		});

		node.addEventListener('dragend', (e) => {
			dragEnd && dragEnd(e);
			node.classList.remove('dragging');
		});
	}

	return {
		destroy() {
			node.draggable = false;
			node.removeEventListener('dragstart', () => {});
			node.removeEventListener('dragend', () => {});
		}
	};
};
