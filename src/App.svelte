<script lang="ts">
  import Board from "./Board.svelte";
	import ButtonsRow from "./ButtonsRow.svelte";
  import Commands from "./Commands.svelte";
	import StateText from "./StateText.svelte";
</script>

<main>
	<h1>MineSweeper</h1>
	<StateText />
	<ButtonsRow />
	<br><br>
  <Board />
  <Commands />
</main>

<style>
  main {
    text-align: center;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 3em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
