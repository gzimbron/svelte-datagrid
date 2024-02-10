import { writable } from 'svelte/store';

export const createCustomState = <T>(initialValue?: T, onUpdate?: () => void) => {
	const { subscribe, update } = writable(initialValue);

	return {
		subscribe,
		set: (newValue: T) => {
			update((actualValue) => {
				if (actualValue === newValue) return actualValue;
				if (onUpdate) onUpdate();
				return newValue;
			});
		}
	};
};

export type CustomState<T> = ReturnType<typeof createCustomState<T>>;
