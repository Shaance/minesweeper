<script lang="ts">
	import { isPlayingState } from "./minesweeper/BoardHelper";
	import { createBoard } from "./minesweeper/BoardManager";
	import board from "./store";

	$: level = $board.level;
  $: size = $board.size;
  $: state = $board.state;
  $: bombsNumber = $board.bombsNumber;
	$: resetBtnText = isPlayingState(state) ? "Reset" : "Play again";

	function resetBoard() {
    board.set(createBoard(level, size, bombsNumber));
  }
</script>


<style>
  .reset-btn {
    font-size: 1em;
		font-weight: 100;
  }

	.reset-btn:hover {
    background-color: lightgray;
  }
</style>

<main>
	<button class="reset-btn" on:click={resetBoard}> {resetBtnText} </button>
</main>
