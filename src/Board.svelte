<script lang="ts">
  import { isPlayingState } from "./minesweeper/BoardHelper";
  import BoardInput from "./minesweeper/BoardInput";
  import { getBoardAfterPlayerMove } from "./minesweeper/BoardManager";
  import type BoardState from "./minesweeper/BoardState";
  import CellType from "./minesweeper/CellType";
  import board from "./store";

  const width = 375;

  $: content = $board.content;
  $: visited = $board.visited;
  $: flagged = $board.flagged;
  $: size = $board.size;
  $: state = $board.state;

  function selectCell(inputMode: BoardInput, i: number, j: number) {
    board.set(getBoardAfterPlayerMove(inputMode, $board, i, j));
  }

  function repeatValueWithSuffix(times: number, value: number, suffix: string) {
    if (times < 0) {
      return;
    }
    let finalStyle = "";
    let counter = 0;
    while (counter !== times) {
      finalStyle += `${value}${suffix} `;
      counter++;
    }
    return finalStyle;
  }

  function getBackgroundColor(
    visited: boolean[][],
    row: number,
    col: number
  ): string {
    const even = (row + col) % 2 == 0;
    if (visited[row][col]) {
      return even ? "#d4c18e" : "#cfbb86";
    }
    return even ? "#9cd14f" : "#95c74c";
  }

  function getCursorStyle(
    visited: boolean[][],
    flagged: boolean[][],
    state: BoardState,
    row: number,
    col: number
  ): string {
    return notClickable(visited, state, row, col) || flagged[row][col]
      ? ""
      : "cursor: pointer;";
  }

  function notClickable(
    visited: boolean[][],
    state: BoardState,
    row: number,
    col: number
  ) {
    return visited[row][col] || !isPlayingState(state);
  }

  function getCellContent(
    visited: boolean[][],
    flagged: boolean[][],
    row: number,
    col: number
  ) {
    const value = content[row][col];
    if (visited[row][col] && value !== CellType.EMPTY) {
      if (value === CellType.BOMB) {
        return "💣";
      }
      return value;
    }
    return flagged[row][col] ? "⛳️" : "";
  }

  function getColorForValue(value: number): string {
    switch (value) {
      case 1:
        return "blue";
      case 2:
        return "green";
      case 3:
        return "red";
      case 4:
        return "purple";
      case 5:
        return "maroon";
      case 6:
        return "turquoise";
      case 7:
        return "black";
      case 8:
        return "grey";
    }
  }
</script>

<main>
  <div
    id="board"
    data-cy="board"
    class="grid"
    style="width: {width}px; 
      grid-template-columns: {repeatValueWithSuffix(size, width / size, 'px')};
      grid-template-rows: {repeatValueWithSuffix(size, width / size, 'px')};"
  >
    {#each content as row, i}
      {#each row as value, j}
        <div class="column">
          <button
            class="cell-button"
            disabled={notClickable(visited, state, i, j)}
            on:click={() => selectCell(BoardInput.REVEAL, i, j)}
            on:contextmenu|preventDefault={() =>
              selectCell(BoardInput.FLAG, i, j)}
            style="background-color:{getBackgroundColor(visited, i, j)};
              color:{getColorForValue(value)};
              {getCursorStyle(visited, flagged, state, i, j)}"
          >
            {getCellContent(visited, flagged, i, j)}
          </button>
        </div>
      {/each}
    {/each}
  </div>
</main>

<style>
  .grid {
    display: inline-grid;
  }

  .column {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .cell-button {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    border-radius: 0px;
  }
</style>
