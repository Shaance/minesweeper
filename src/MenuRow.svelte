<script lang="ts">
  import LevelPicker from "./LevelPicker.svelte";
  import ResetButton from "./ResetButton.svelte";
  import Flags from "./Flags.svelte";
  import Timer from "./Timer.svelte";
</script>

<main>
  <Flags />
  <Timer />
  <LevelPicker />
  <ResetButton />
</main>

<style>
  main {
    display: inline-block;
  }
</style>
