<script lang="ts">
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
</main>

<style>
  h2 {
    font-size: 2em;
    font-weight: 100;
  }
</style>
