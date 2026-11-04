<script lang="ts">
  import { onMount } from 'svelte';
  let { reduced }: { reduced: boolean } = $props();
  let confetti = $state(true);
  const colors = ['cyan', 'lime', 'pink', 'yellow', 'orange', 'magenta', 'white', 'hi'];
  onMount(() => {
    const timeout = window.setTimeout(() => confetti = false, 1400);
    return () => clearTimeout(timeout);
  });
</script>

<div class="celebration" class:still={reduced} aria-hidden="true">
  <div class="banner">STAGE CLEAR</div>
  {#if confetti && !reduced}
    <div class="confetti">
      {#each Array.from({ length: 40 }, (_, i) => i) as i}
        <i style={'--x: ' + ((i * 37) % 100) + '%; --drift: ' + ((i * 23) % 120 - 60) +
          'px; --fall: ' + (160 + (i * 17) % 180) + 'px; --spin: ' + (i % 4) * 90 +
          'deg; --color: var(--' + colors[i % colors.length] + ')' + (i % 3 === 0 ? '; animation-delay: ' + (i % 5) * 40 + 'ms' : '')}></i>
      {/each}
    </div>
  {/if}
</div>

<style>
  .celebration { position: absolute; inset: 0; pointer-events: none; z-index: 3; overflow: hidden; }
  .banner {
    position: absolute; top: 20%; left: 50%; width: max-content;
    padding: 20px 16px; border: 4px solid var(--magenta);
    background: var(--bg); color: var(--cyan); font-size: 16px;
    transform: translateX(-50%);
  }
  .celebration:not(.still) .banner { animation: bannerfx 280ms steps(1, end); }
  .confetti { position: absolute; top: 20%; left: 8%; width: 84%; }
  i {
    position: absolute; left: var(--x); width: 4px; height: 4px;
    background: var(--color);
  }
  .celebration:not(.still) i { animation: confettifx 1.4s steps(14) both; }
  @keyframes bannerfx {
    0% { transform: translate(-50%, -160px); }
    55% { transform: translate(-50%, -6px); }
    78% { transform: translate(-50%, 2px); }
    100% { transform: translate(-50%, 0); }
  }
  @keyframes confettifx {
    from { transform: translate(0, 0) rotate(0deg); }
    to { transform: translate(var(--drift), var(--fall)) rotate(var(--spin)); }
  }
  @media (prefers-reduced-motion: reduce) {
    .banner, i { animation: none !important; }
    .confetti { display: none; }
  }
</style>
