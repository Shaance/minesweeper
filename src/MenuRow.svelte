<script lang="ts">
  import LevelPicker from "./LevelPicker.svelte";
  import ResetButton from "./ResetButton.svelte";
  import Flags from "./Flags.svelte";
</script>

<main>
  <Flags />
  <LevelPicker />
  <ResetButton />
</main>

<style>
  main {
    display: inline-block;
  }
</style>
