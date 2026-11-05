<script lang="ts">
  const dev = import.meta.env.DEV;
</script>

<footer>
  <a href="https://github.com/Shaance/minesweeper">Code on GitHub</a>
  {#if dev}<span aria-hidden="true"> · </span><a href="?mocks">Mocks</a>{/if}
</footer>

<style>
  footer { margin-top: 36px; text-align: center; font-size: 9px; line-height: 2; }
</style>
