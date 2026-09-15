<script lang="ts">
  import { onMount } from 'svelte';
  let { reduced }: { reduced: boolean } = $props();
  let confetti = $state(true);
  const colors = ['cyan', 'lime', 'pink', 'yellow', 'orange', 'magenta', 'white', 'hi'];
  onMount(() => {
    const timeout = window.setTimeout(() => confetti = false, 1200);
    return () => clearTimeout(timeout);
  });
</script>

<div class="celebration" aria-hidden="true">
  <div class="banner">STAGE CLEAR</div>
  {#if confetti && !reduced}
    <div class="confetti">
      {#each Array.from({ length: 40 }, (_, i) => i) as i}
        <i style={'--x: ' + ((i * 37) % 100) + '%; --drift: ' + ((i * 23) % 120 - 60) +
          'px; --fall: ' + (160 + (i * 17) % 180) + 'px; --color: var(--' + colors[i % colors.length] + ')'}></i>
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
    transform: translateX(-50%); animation: banner 240ms steps(6);
  }
  .confetti { position: absolute; top: 20%; left: 8%; width: 84%; }
  i {
    position: absolute; left: var(--x); width: 4px; height: 4px;
    background: var(--color); animation: confetti 1.2s steps(12) both;
  }
  @keyframes banner { from { transform: translate(-50%, -160px); } to { transform: translate(-50%, 0); } }
  @keyframes confetti {
    from { transform: translate(0, 0); }
    to { transform: translate(var(--drift), var(--fall)); }
  }
  @media (prefers-reduced-motion: reduce) {
    .banner { animation: none; }
    .confetti { display: none; }
    i { animation: none; }
  }
</style>
