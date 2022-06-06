<script lang="ts">
  import Board from "./Board.svelte";
  import MenuRow from "./MenuRow.svelte";
  import Commands from "./Commands.svelte";
  import StateText from "./StateText.svelte";
  import AboutFooter from "./AboutFooter.svelte";
</script>

<main>
  <h1 id="title" data-cy="title">Hello Helsing</h1>
  <StateText />
  <MenuRow />
  <br /><br />
  <Board />
  <Commands />
  <AboutFooter />
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
