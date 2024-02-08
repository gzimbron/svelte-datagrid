<script lang="ts">
	import CheckboxCell from '$lib/components/CheckboxCell.svelte';
	import Datagrid from '$lib/components/Datagrid.svelte';
	import SelectCell from '$lib/components/SelectCell.svelte';
	import TextboxCell from '$lib/components/TextboxCell.svelte';
	import type { GridCellUpdated, GridColumn, GridColumnOption } from '$lib/types.js';
	import Message from '$sitecomponent/Message.svelte';
	import Progressbar from '$sitecomponent/Progressbar.svelte';

	let progress = 0;
	interface Person {
		id: string;
		name: string;
		married: boolean;
		age: number;
		englishLevel: string;
	}

	const nivelIngles: GridColumnOption[] = [
		{ value: 'A1', label: 'A1' },
		{ value: 'A2', label: 'A2' },
		{ value: 'B1', label: 'B1' },
		{ value: 'B2', label: () => 'Super B2' },
		{ value: 'C1', label: 'C1' },
		{ value: 'C2', label: 'C2' }
	];

	const columns: GridColumn<Person>[] = [
		{
			label: 'ID',
			dataKey: 'id',
			width: 100
		},
		{
			label: 'Name',
			dataKey: 'name',
			width: 300,
			cellComponent: TextboxCell
		},
		{
			label: 'Married',
			dataKey: 'married',
			width: 100,
			cellComponent: CheckboxCell
		},
		{
			label: 'English Level',
			dataKey: 'englishLevel',
			width: 200,
			options: nivelIngles,
			cellComponent: SelectCell
		},
		{
			label: 'Age',
			dataKey: 'age',
			width: 150
		}
	];

	const generatePersons = (length: number, startFrom = 0): Person[] => {
		return Array.from({ length }, (_, i) => {
			const randomUUID = `U${startFrom + i + 1}`;
			const randomName = `Super Cool Name ${randomUUID}`;
			return {
				id: randomUUID,
				name: randomName,
				age: Math.ceil(Math.random() * 55),
				married: Math.random() > 0.5,
				englishLevel: nivelIngles[Math.floor(Math.random() * nivelIngles.length)].value
			};
		});
	};

	let rows = generatePersons(200);

	const addRows = (max = 50) => {
		const newRows = generatePersons(max, rows.length);

		rows = [...rows, ...newRows];
	};

	let rowHeight = 25;

	const onValueUpdated = ({ detail }: CustomEvent<GridCellUpdated<Person>>) => {
		const { rowIndex, column, value, row } = detail;

		console.log(
			`Row ${rowIndex} Column "${column.label}" updated. \nPast Value: ${row[column.dataKey]}\nNew Value: ${value}`
		);
	};

	const gridScrolled = ({ detail: percent }: CustomEvent<number>) => {
		progress = percent;
		if (percent > 70 && rows.length < 500) {
			addRows(50);
		}
	};
</script>

<section class="grid-cointainer">
	<Datagrid
		{columns}
		bind:rows
		bind:rowHeight
		on:valueUpdated={onValueUpdated}
		on:scroll={gridScrolled}
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
				rows = [...rows, ...generatePersons(5000, rows.length)];
			}}
		>
			+ 5000 Rows
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
