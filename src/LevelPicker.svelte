<script lang="ts">
  import { createBoard } from "./minesweeper/BoardManager";
  import Level from "./minesweeper/Level";
  import board from "./store";

  interface LevelOption {
    id: Level;
    text: string;
  }

  let levels = [
    { id: Level.EASY, text: `Easy` },
    { id: Level.MEDIUM, text: `Medium` },
    { id: Level.HARD, text: `Hard` },
  ];

  let selected: LevelOption;

  function changeLevel() {
    board.set(createBoard(selected.id));
  }
</script>

<main>
  <!-- svelte-ignore a11y-no-onchange -->
  <select id="level-picker" data-cy="level-picker" bind:value={selected} on:change={changeLevel}>
    {#each levels as level}
      <option value={level}>
        {level.text}
      </option>
    {/each}
  </select>
</main>

<style>
  main {
    display: inline-block;
  }
  select {
    font-size: 1em;
    font-weight: 100;
    text-align-last: center;
    margin-right: 20px;
  }
</style>
