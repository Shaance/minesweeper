<script lang="ts">
	import { isPlayingState } from "./minesweeper/BoardHelper";
  import BoardState from "./minesweeper/BoardState";
	import board from "./store";

  $: state = $board.state;  
  $: endGameText = state === BoardState.WON ? "You won! 🙌" : "You lost.. 😫";
</script>


<style>
    h2 {
    font-size: 2em;
    font-weight: 100;
  }
</style>

<main>
  {#if !isPlayingState(state)}
    <h2>{endGameText}</h2>
  {:else}
    <h2>Avoid the 💣💥</h2>
  {/if}
</main>
