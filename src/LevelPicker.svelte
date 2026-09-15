<script lang="ts">
  import Level from './minesweeper/Level';
  let { level, onchange }: { level: Level; onchange: (level: Level) => void } = $props();
</script>

<div class="levels" role="group" aria-label="Difficulty">
  {#each [Level.EASY, Level.MEDIUM, Level.HARD] as option}
    <button class:active={level === option} aria-pressed={level === option} onclick={() => onchange(option)}>
      {option}
    </button>
  {/each}
</div>

<style>
  .levels { display: flex; gap: 12px; margin-bottom: 28px; }
  button { flex: 1; font-size: 10px; min-height: 40px; }
  button.active { box-shadow: 4px 4px 0 var(--lo); }
  button:active { transform: translate(2px, 2px); }
  button.active:active { box-shadow: 2px 2px 0 var(--lo); }
</style>
