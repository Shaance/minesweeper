<script lang="ts">
import { onMount } from 'svelte';

	import type Board from './minesweeper/Board';
	import { createBoard } from './minesweeper/BoardManager';
	let board: Board;

	$: content = board ? board.content : [];
	$: visited = board ? board.visited : [];
	$: flagged = board ? board.flagged : [];

	onMount(() => {
    board = createBoard(5, 5);
	});
	
	function handleClick() {
		board = createBoard(5, 5);
	}
</script>

<main>
	<h1>Hello Boss!</h1>
	<button on:click={handleClick}>
		Reset board
	</button>
	{#each content as row, i}
		{#each row as value, j}
			<p>Row {i}, Column {j}, value {value} </p>
		{/each}
	<br />
	{/each}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>