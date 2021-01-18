<script lang="ts">
  import BoardInput from "./minesweeper/BoardInput";
  import {
    createBoard,
    getBoardAfterPlayerMove,
  } from "./minesweeper/BoardManager";
  import BoardState from "./minesweeper/BoardState";
  import CellType from "./minesweeper/CellType";

  const DEFAULT_SIZE = 8;
  const DEFAULT_BOMBS_NUMBER = 11;
  const width = 400;

  let board = createBoard(DEFAULT_SIZE, DEFAULT_BOMBS_NUMBER);

  $: content = board.content;
  $: visited = board.visited;
  $: flagged = board.flagged;
  $: state = board.state;
  $: resetBtnText = isPlayingState(state) ? "Reset" : "Play again";
  $: endGameText = state === BoardState.WON ? "You won! 🙌" : "You lost.. 😫";

  function isPlayingState(state: BoardState) {
    return state === BoardState.INITIAL || state === BoardState.PLAYING;
  }

  function resetBoard() {
    board = createBoard(DEFAULT_SIZE, DEFAULT_BOMBS_NUMBER);
  }

  function selectCell(inputMode: BoardInput, i: number, j: number) {
    board = getBoardAfterPlayerMove(inputMode, board, i, j);
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

  function getBackgroundColor(visited: boolean[][], row: number, col: number): string {
    const even = (row + col) % 2 == 0;
    if (visited[row][col]) {
      return even ? '#d4c18e' : '#cfbb86';  
    }
    return even ? '#9cd14f' : '#95c74c';
  }

  function getCursorStyle(visited: boolean[][], flagged: boolean[][], state: BoardState, row: number, col: number): string {
    return notClickable(visited, state, row, col) || flagged[row][col] ?  '' : 'cursor: pointer;'
  }

  function notClickable(visited: boolean[][], state: BoardState, row: number, col: number) {
    return visited[row][col] || !isPlayingState(state);
  }

  function getCellContent(visited: boolean[][], flagged: boolean[][], row: number, col: number) {
    const value = content[row][col];
    if (visited[row][col] && value !== CellType.EMPTY) {
      if (value === CellType.BOMB) {
        return '💣';
      }
      return value;
    }
    return flagged[row][col] ? '⛳️' : '';
  }

  function getColorForValue(value: number): string {
    switch (value) {
      case 1:
        return 'blue';
      case 2:
        return 'green';
      case 3:
        return 'red';
      case 4:
        return 'purple';
      case 5:
        return 'maroon';
      case 6:
        return 'turquoise';
      case 7:
        return 'black';
      case 8:
        return 'grey';
    }
  }
</script>

<style>
  h2 {
    font-size: 2em;
		font-weight: 100;
  }

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
  }
  
  .reset-btn {
    font-size: 1em;
		font-weight: 100;
  }

  .reset-btn:hover {
    background-color: lightgray;
  }
</style>

<main>
  {#if !isPlayingState(state)}
    <h2>{endGameText}</h2>
  {:else}
    <h2>Avoid the 💣💥</h2>
  {/if}
  <button class="reset-btn" on:click={resetBoard}> {resetBtnText} </button>
  <br><br>
  <div
    class="grid"
    style="width: {width}px; 
  grid-template-columns: {repeatValueWithSuffix(DEFAULT_SIZE, width / DEFAULT_SIZE, 'px')};
  grid-template-rows: {repeatValueWithSuffix(DEFAULT_SIZE, width / DEFAULT_SIZE, 'px')};">
    {#each content as row, i}
      {#each row as value, j}
        <div class="column">
            <button class="cell-button"
              disabled={notClickable(visited, state, i, j)}
              on:click={() => selectCell(BoardInput.REVEAL, i, j)}
              on:contextmenu|preventDefault={() => selectCell(BoardInput.FLAG, i, j)}
              style="background-color:{getBackgroundColor(visited, i, j)};
              color:{getColorForValue(value)};
              {getCursorStyle(visited, flagged, state, i, j)}">
              {getCellContent(visited, flagged, i, j)}
            </button>
        </div>
      {/each}
    {/each}
  </div>
</main>
