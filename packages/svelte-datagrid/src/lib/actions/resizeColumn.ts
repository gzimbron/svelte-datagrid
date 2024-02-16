import type { Action } from 'svelte/action';

interface ActionParams {
	resizable?: boolean;
	startResize?: () => void;
	endResize?: () => void;
	onResize?: (data: number) => void;
}

export const reziseColumn: Action<HTMLElement, ActionParams> = (
	node,
	{ resizable, onResize, startResize, endResize }: ActionParams = {}
) => {
	if (!resizable) return;

	let lastX = 0;

	const mouseMoveEvent = (e: MouseEvent) => {
		if (!onResize) return;
		if (e.clientX === lastX) return;
		lastX = e.clientX;
		onResize(lastX - node.getBoundingClientRect().left);
	};

	const mouseDownEvent = (e: MouseEvent) => {
		if (e.button !== 0) {
			return;
		}
		lastX = e.clientX;

		// get node width and style ::after
		const nodeAfterWidth = parseInt(
			window.getComputedStyle(node, ':after').width.replace('px', '')
		);
		const clickPosition = e.clientX - node.getBoundingClientRect().left;

		if (clickPosition < node.offsetWidth - nodeAfterWidth - 2) return;

		startResize && startResize();

		document.addEventListener('mousemove', mouseMoveEvent);
		document.addEventListener('mouseup', mouseUpEvent);
	};

	const mouseUpEvent = () => {
		endResize && endResize();
		document.removeEventListener('mousemove', mouseMoveEvent);
	};

	node.addEventListener('mousedown', mouseDownEvent);

	return {
		destroy() {
			document.removeEventListener('mousedown', mouseDownEvent);
			node.removeEventListener('mouseup', () => mouseUpEvent);
		}
	};
};
