<script lang="ts">
  import board from "./store";
</script>

<main>
    ⛳️  {$board.availableFlags}
</main>

<style>
  main {
    display: inline-block;
    text-align: left;
    font-size: 20px;
    font-weight: 300;
    margin-top: 20px;
    min-width: 60px;
  }
</style>
