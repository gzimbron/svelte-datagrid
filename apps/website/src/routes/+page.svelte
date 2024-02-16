<script lang="ts">
	import { Datagrid, CheckboxCell, SelectCell, TextboxCell } from '@gzim/svelte-datagrid';
	import type { GridCellUpdated, GridColumn, GridColumnOption } from '@gzim/svelte-datagrid/types';
	import Message from '$sitecomponent/Message.svelte';
	import Progressbar from '$sitecomponent/Progressbar.svelte';
	import { faker } from '@faker-js/faker';
	import Swal from 'sweetalert2';

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
			draggable: true,
			resizable: true
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
	let rowsPerPage = 10;

	const onValueUpdated = ({ detail }: CustomEvent<GridCellUpdated<Person>>) => {
		const { rowIndex, column, value, row } = detail;

		console.log(`Row ${rowIndex} "${column.label}" updated: \n${row[column.dataKey]} => ${value}`);
	};

	const gridScrolled = ({ detail: percent }: CustomEvent<number>) => {
		progress = percent;

		if (percent > 70 && rows.length < 500) {
			addRows(50);
		}
	};

	const showGridState = () => {
		const state = getGridState();
		if (!state) return;
		Swal.fire({
			title: '⚙️ Grid State',
			html: `<pre class="text-left">${JSON.stringify(state, null, 2)}</pre>`,
			confirmButtonText: 'Close'
		});
	};

	const goToItem = async () => {
		const { isConfirmed, value } = await Swal.fire({
			title: 'Go to row index',
			input: 'number',
			inputValidator(value) {
				if (!value || parseInt(value) < 0) {
					return 'Please enter a number greater than 0';
				}
				if (parseInt(value) > rows.length - 1) {
					return `Max row index: ${rows.length - 1}`;
				}
			},
			showCancelButton: true
		});

		if (!isConfirmed || !value) return;

		scrollToRow(parseInt(value));
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let getGridState: () => any | undefined;
	let scrollToRow: (index: number) => void | undefined;
	let allColumnsResizable = true;
</script>

<Progressbar {progress}></Progressbar>
<section class="grid-cointainer">
	<Datagrid
		headerRowHeight={30}
		{columns}
		{rowsPerPage}
		bind:getGridState
		bind:scrollToRow
		bind:rows
		bind:rowHeight
		on:valueUpdated={onValueUpdated}
		on:scroll={gridScrolled}
		on:columnsSwapped={({ detail }) => console.log(detail)}
		{allColumnsResizable}
	/>
</section>

{#if rows.length < 500}
	<Message>Scroll ~70% of the grid to add more rows programatically (max 500 rows)</Message>
{/if}

<section class="controls">
	<p class="bg-teal-100 rounded-md w-full px-2 py-1 text-teal-800">
		<span>Rows count: {rows.length} </span>
	</p>
	<div class="flexy">
		<button class="btn btn-primary" on:click={() => addRows()}> + 50 Rows </button>
		<button
			class="btn btn-primary"
			on:click={() => {
				rows = [...rows, ...generatePersons(5000)];
			}}
		>
			+ 5000 Rows
		</button>
		<button class="btn btn-secondary" on:click={showGridState} disabled={!getGridState}>
			💬 Grid State
		</button>
		<button class="btn btn-secondary" on:click={goToItem} disabled={!scrollToRow}>
			🔎 Scroll To
		</button>
	</div>

	<div class="flexy">
		<label for="allColumnsResizable">
			<p>Resizable Columns</p>
			<input type="checkbox" id="allColumnsResizable" bind:checked={allColumnsResizable} />
		</label>
		<label for="rowheight">
			<p>Row Height: {rowHeight}</p>
			<input type="range" min={20} max={50} step={1} id="rowheight" bind:value={rowHeight} />
		</label>
		<label for="rowsperpage">
			<p>Rows per page: {rowsPerPage}</p>
			<input type="range" min={5} max={20} step={1} id="rowsperpage" bind:value={rowsPerPage} />
		</label>
	</div>
</section>

<style lang="postcss">
	.grid-cointainer {
		@apply w-full;
	}

	section.controls {
		@apply flex flex-col items-center p-4 bg-slate-50 rounded-md border-slate-300 border-2 gap-4;
	}

	.flexy {
		@apply flex flex-wrap gap-4 justify-center;
	}

	.flexy label {
		@apply flex flex-col items-center gap-2;
	}
</style>
