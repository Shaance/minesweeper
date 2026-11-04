<script lang="ts">
  import { untrack } from 'svelte';
  import { renderSprite } from '../sprites';

  let { value, visited, flagged, lost, reduced, delay, detonated, hopDelay, dealDelay, preview }: {
    value: number; visited: boolean; flagged: boolean; lost: boolean; reduced: boolean;
    delay: number; detonated: boolean; hopDelay: number; dealDelay: number; preview: boolean;
  } = $props();

  let shown = $state(false);
  const colors = ['hi', 'cyan', 'lime', 'pink', 'yellow', 'orange', 'magenta', 'white', 'hi'];

  $effect(() => {
    if (!visited) { shown = false; return; }
    const wait = reduced ? 0 : untrack(() => delay);
    const arrival = setTimeout(() => { shown = true; }, wait);
    return () => clearTimeout(arrival);
  });

  const fx = $derived(!reduced);
  const style = $derived(
    '--number: var(--' + colors[Math.max(0, value)] + ');' +
    (dealDelay >= 0 ? '--d: ' + dealDelay + 'ms;' : '') +
    (hopDelay >= 0 ? '--h: ' + hopDelay + 'ms;' : ''),
  );
</script>

<button class="lcell" class:open={shown} class:anim={fx}
  class:detonated={detonated && shown} class:mine={value === -1 && shown}
  class:armed={fx && preview && !shown && !flagged}
  class:deal={fx && dealDelay >= 0} class:hop={fx && hopDelay >= 0}
  {style} tabindex={-1} aria-label="demo tile">
  {#if shown && fx}<span class="cover" aria-hidden="true"></span>{/if}
  {#if shown}
    {#if value === -1}
      {#if lost}<span class="sprite xboom">{@html renderSprite('boom')}</span>{/if}
      <span class="sprite lmine">{@html renderSprite('mine')}</span>
    {:else if value > 0}
      <span class="number">{value}</span>
    {/if}
  {:else if flagged}
    <span class="sprite lflag">{@html renderSprite('flag')}</span>
    {#if fx}<span class="puff" aria-hidden="true"><i></i><i></i></span>{/if}
  {/if}
</button>

<style>
  .lcell {
    position: relative; display: grid; place-items: center; width: 100%; height: 100%;
    min-width: 0; padding: 0; border: 4px solid;
    border-color: var(--hi) var(--lo) var(--lo) var(--hi);
    background: var(--mid); touch-action: manipulation;
  }
  .lcell.open { border: 1px solid var(--grid); background: var(--open); }
  .lcell.detonated { background: var(--pink); }
  .lcell.anim.detonated { animation: flash 240ms steps(1, end) forwards; }
  .number { color: var(--number); font-size: 16px; text-shadow: 0 0 6px currentColor; }
  .lcell.anim .number { animation: numfx var(--fast) steps(2); }
  .sprite { width: 22px; height: 22px; display: block; }
  .sprite :global(svg) { display: block; width: 100%; height: 100%; }
  .lcell.anim .lflag { color: var(--red); animation: stab 120ms steps(1, end); }
  .lcell:not(.anim) .lflag { color: var(--red); }
  .lcell.anim .lmine { color: var(--white); animation: minepop var(--fast) steps(2); }
  .lcell:not(.anim) .lmine { color: var(--white); }
  .xboom { position: absolute; color: var(--yellow); }
  .lcell.anim .xboom { animation: boomfx 300ms steps(1, end) forwards; }
  .lcell:not(.anim) .xboom { visibility: hidden; }
  .cover {
    position: absolute; inset: 0; pointer-events: none;
    background: var(--mid); border: 4px solid;
    border-color: var(--hi) var(--lo) var(--lo) var(--hi);
  }
  .lcell.anim .cover { animation: crumble 140ms steps(1, end) forwards; }
  .puff { position: absolute; inset: 0; pointer-events: none; }
  .puff i {
    position: absolute; bottom: 2px; width: 3px; height: 3px; background: var(--hi);
    animation: pufffx 160ms steps(2, end) forwards;
  }
  .puff i:first-child { left: 30%; }
  .puff i:last-child { right: 30%; animation-delay: 40ms; }
  .lcell.armed { animation: armed 300ms steps(1, end) both; }
  @keyframes armed {
    0% { background: #7c4fe6; }
    50% { background: var(--mid); }
    100% { background: #7c4fe6; }
  }
  .lcell.deal {
    transform: scale(0.55);
    animation: deal var(--fast) steps(2, end) forwards;
    animation-delay: var(--d);
  }
  .lcell.hop { animation: hop 200ms steps(1, end) both; animation-delay: var(--h); }
  @keyframes crumble {
    0% { transform: scale(1); }
    34% { transform: scale(0.66); }
    67% { transform: scale(0.33); }
    100% { transform: scale(0); }
  }
  @keyframes numfx { from { transform: scale(1.8); } to { transform: scale(1); } }
  @keyframes stab {
    0% { transform: translateY(-8px); }
    60% { transform: translateY(1px); }
    100% { transform: translateY(0); }
  }
  @keyframes pufffx {
    from { opacity: 1; transform: translateY(0) scale(1); }
    to { opacity: 0; transform: translateY(4px) scale(2.4); }
  }
  @keyframes boomfx {
    0% { transform: scale(0.4); opacity: 1; }
    45% { transform: scale(1.4); opacity: 1; }
    75% { transform: scale(2.2); opacity: 1; }
    100% { transform: scale(2.2); opacity: 0; }
  }
  @keyframes minepop { from { transform: scale(1.6); } to { transform: scale(1); } }
  @keyframes flash {
    0% { background: var(--white); }
    35% { background: var(--pink); }
    100% { background: var(--pink); }
  }
  @keyframes deal { from { transform: scale(0.55); } to { transform: scale(1); } }
  @keyframes hop {
    0% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
    100% { transform: translateY(0); }
  }
</style>
