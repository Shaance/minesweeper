<script lang="ts">
  // import { isPlayingState } from "./minesweeper/BoardHelper";
  import BoardState from "./minesweeper/BoardState";
  import board from "./store";

  $: state = $board.state;
  $: stateText = getStateText(state);

  function getStateText(boardState: BoardState) {
    if (boardState === BoardState.WON) {
      return "You won! 🙌";
    } else if (boardState === BoardState.LOST) {
      return "You lost.. 😫";
    }
    return 'Avoid the 💣💥';
  }
</script>

<main>
  <h2 id="state-text" data-cy="state-text">{stateText}</h2>
  <!-- {#if !isPlayingState(state)}
    <h2 id="endgame-text" data-cy="endgame-text">{stateText}</h2>
  {:else}
    <h2 id="instructions" data-cy="instructions">Avoid the 💣💥</h2>
  {/if} -->
</main>

<style>
  h2 {
    font-size: 2em;
    font-weight: 100;
  }
</style>
