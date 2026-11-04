<script lang="ts">
  import CurrentBoard from './CurrentBoard.svelte';
  import FxBoard from './FxBoard.svelte';
  import type { Scenario } from './scenarios';

  let { variant, scenario, cell, reduced, globalTick, label, note, spec }: {
    variant: 'current' | 'fx'; scenario: Scenario; cell: number; reduced: boolean;
    globalTick: number; label: string; note: string; spec: string;
  } = $props();

  let localTick = $state(0);
  const tick = $derived(localTick + globalTick);
</script>

<div class="card" class:fx={variant === 'fx'}>
  <span class="tag">{label}</span>
  {#if variant === 'current'}
    <CurrentBoard {scenario} {reduced} {tick} {cell} />
  {:else}
    <FxBoard {scenario} {reduced} {tick} {cell} />
  {/if}
  <button class="play" onclick={() => localTick++}>▶ PLAY</button>
  <p class="note">{note}</p>
  <p class="spec">{spec}</p>
</div>

<style>
  .card {
    position: relative; display: flex; flex-direction: column; gap: 14px;
    padding: 16px; background: var(--panel); border: 2px solid var(--mid);
  }
  .card.fx { border-color: var(--cyan); box-shadow: 0 0 24px #22d3ee33; }
  .tag {
    align-self: flex-start; padding: 6px 8px; font-size: 8px;
    background: var(--lo); color: var(--hi); border: 2px solid var(--mid);
  }
  .card.fx .tag { color: var(--bg); background: var(--cyan); border-color: var(--cyan); }
  .play { width: 100%; min-height: 40px; font-size: 10px; }
  .play:active { transform: translate(2px, 2px); }
  .note { margin: 0; font-size: 9px; line-height: 2; color: var(--hi); }
  .spec { margin: 0; font-size: 8px; line-height: 1.8; color: var(--lime); }
</style>
