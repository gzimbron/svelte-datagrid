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
		node.addEventListener('dragstart', (e) => {
			const div = e.target as HTMLElement;
			const isRezisable = div.classList.contains('resizable');

			if (isRezisable) {
				const resizableWidth = parseInt(
					window.getComputedStyle(div, '::after').width.replace('px', '')
				);

				const clickPosition = e.clientX - div.getBoundingClientRect().left;

				if (clickPosition >= div.offsetWidth - resizableWidth - 2) {
					e.preventDefault();
					return;
				}
			}

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
			node.removeEventListener('dragstart', () => {});
			node.removeEventListener('dragend', () => {});
		}
	};
};
