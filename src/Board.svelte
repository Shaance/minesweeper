<script lang="ts">
  import { onMount } from "svelte";

  import type Board from "./minesweeper/Board";
  import { createBoard } from "./minesweeper/BoardManager";
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

<style>
  .grid {
    display: grid;
    grid-auto-columns: 100px;
    width: 500px;
    overflow: auto;
    border: 1px solid #000;
  }
  .column {
    grid-row: 1;
  }
</style>

<main>
  <button on:click={handleClick}> Reset</button>
  <div class="grid">
    {#each content as row, i}
      <div class="column">
        {#each row as value, j}
          <div>
            {value}
          </div>
        {/each}
      </div>
    {/each}
  </div>
</main>