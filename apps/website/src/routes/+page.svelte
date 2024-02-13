<script lang="ts">
	import { Datagrid, CheckboxCell, SelectCell, TextboxCell } from '@gzim/svelte-datagrid';
	import type { GridCellUpdated, GridColumn, GridColumnOption } from '@gzim/svelte-datagrid/types';
	import Message from '$sitecomponent/Message.svelte';
	import Progressbar from '$sitecomponent/Progressbar.svelte';
	import { faker } from '@faker-js/faker';

	let progress = 0;
	interface Person {
		zodiac: string;
		firstName: string;
		lastName: string;
		married: boolean;
		englishLevel: string;
	}

	const nivelIngles: GridColumnOption[] = [
		{ value: 'A1', label: 'A1' },
		{ value: 'A2', label: 'A2' },
		{ value: 'B1', label: 'B1' },
		{ value: 'B2', label: 'B2' },
		{ value: 'C1', label: 'C1' },
		{ value: 'C2', label: 'C2' }
	];

	const columns: GridColumn<Person>[] = [
		{
			label: 'Zodiac',
			dataKey: 'zodiac',
			width: 100
		},
		{
			label: 'First Name',
			dataKey: 'firstName',
			width: 200,
			cellComponent: TextboxCell,
			draggable: true
		},
		{
			label: 'Last Name',
			dataKey: 'lastName',
			width: 200,
			draggable: true
		},
		{
			label: 'Married',
			dataKey: 'married',
			width: 100,
			cellComponent: CheckboxCell,
			draggable: true
		},
		{
			label: 'English Level',
			dataKey: 'englishLevel',
			width: 150,
			options: nivelIngles,
			cellComponent: SelectCell,
			draggable: true
		}
	];

	const generatePersons = (length: number): Person[] => {
		return Array.from({ length }, () => {
			return {
				zodiac: faker.person.zodiacSign(),
				firstName: faker.person.firstName(),
				lastName: faker.person.lastName(),
				married: Math.random() > 0.5,
				englishLevel: nivelIngles[Math.floor(Math.random() * nivelIngles.length)].value
			};
		});
	};

	let rows = generatePersons(200);

	const addRows = (max = 50) => {
		const newRows = generatePersons(max);

		rows = [...rows, ...newRows];
	};

	let rowHeight = 25;

	const onValueUpdated = ({ detail }: CustomEvent<GridCellUpdated<Person>>) => {
		const { rowIndex, column, value, row } = detail;

		console.log(
			`Row ${rowIndex} Column "${column.label}" updated. \nPast Value: ${
				row[column.dataKey]
			}\nNew Value: ${value}`
		);
	};

	const gridScrolled = ({ detail: percent }: CustomEvent<number>) => {
		progress = percent;

		if (percent > 70 && rows.length < 500) {
			addRows(50);
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let getGridState: () => any | undefined;
	let scrollToRow: (index: number) => void | undefined;
</script>

<section class="grid-cointainer">
	<Datagrid
		bind:getGridState
		bind:scrollToRow
		{columns}
		bind:rows
		bind:rowHeight
		on:valueUpdated={onValueUpdated}
		on:scroll={gridScrolled}
		on:columnsSwapped={({ detail }) => console.log(detail)}
	/>
</section>
<Progressbar {progress}></Progressbar>
<Message>Scroll ~70% of the grid to add more rows programatically (max 500 rows)</Message>

<section class="controls">
	<p class="bg-teal-100 rounded-md w-full px-2 py-1 text-teal-800">
		<span>Rows count: {rows.length} </span>
	</p>
	<div>
		<button class="btn btn-secondary" on:click={() => addRows()}> + 50 Rows </button>
		<button
			class="btn btn-primary"
			on:click={() => {
				rows = [...rows, ...generatePersons(5000)];
			}}
		>
			+ 5000 Rows
		</button>
		<button
			class="btn btn-primary"
			on:click={() => {
				if (!getGridState) return;
				console.log(getGridState());
			}}
		>
			🖨️ Grid State
		</button>
	</div>

	<p>
		<label for="rowheight">
			Row Height:
			<input class="input" type="number" id="rowheight" bind:value={rowHeight} />
		</label>
	</p>
</section>

<style lang="postcss">
	.grid-cointainer {
		@apply w-full h-96;
	}

	section.controls {
		@apply flex flex-col items-center p-4 bg-slate-50 rounded-md border-slate-300 border-2 gap-4;
	}
</style>
