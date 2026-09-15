<script lang="ts">
  import BoardState from './minesweeper/BoardState';
  import { renderSprite } from './sprites';
  let { flags, seconds, boardState, pressed, reduced, onreset }: {
    flags: number; seconds: number; boardState: BoardState;
    pressed: boolean; reduced: boolean; onreset: () => void;
  } = $props();
  let blink = $state(false);
  const face = $derived(boardState === BoardState.LOST ? 'dead' :
    boardState === BoardState.WON ? 'cool' : pressed ? 'worried' : blink ? 'blink' : 'face');

  // Idle blink: closed eyes for one frame every few seconds while nothing else is going on.
  $effect(() => {
    const timer = setInterval(() => {
      blink = true;
      setTimeout(() => blink = false, 120);
    }, 3800);
    return () => clearInterval(timer);
  });
  const digits = $derived(String(seconds).padStart(3, '0'));
</script>

<div class="hud">
  <output class="led" aria-label={flags + ' flags remaining'}>{String(flags).padStart(3, '0')}</output>
  <button class="face" aria-label="New game" onclick={onreset}>
    {@html renderSprite(face)}
  </button>
  <output class="led timer" aria-label={seconds + ' seconds'}>
    {#each [...digits] as digit}
      <span class="digit">
        {#if boardState === BoardState.WON && !reduced}
          <span class="digit-roll">
            {#each Array.from({ length: 11 }, (_, i) => Math.floor(Number(digit) * i / 10)) as value}
              <span>{value}</span>
            {/each}
          </span>
        {:else}
          {digit}
        {/if}
      </span>
    {/each}
  </output>
</div>

<style>
  .hud { display: flex; align-items: center; justify-content: space-between; margin: 28px 0 20px; }
  .led {
    display: flex; align-items: center; justify-content: center;
    background: #000; border: 2px solid var(--lo); color: var(--red);
    text-shadow: 0 0 8px var(--red); font-size: 22px; letter-spacing: 2px;
    padding: 12px 8px; min-width: 96px; height: 52px;
  }
  .face {
    width: 56px; height: 56px; padding: 8px; color: var(--yellow);
    border: 4px solid; border-color: var(--hi) var(--lo) var(--lo) var(--hi);
    background: var(--mid);
  }
  .face:active { border-color: var(--lo) var(--hi) var(--hi) var(--lo); }
  @media (hover: hover) { .face:hover { background: #7c4fe6; } }
  .face :global(svg) { display: block; width: 32px; height: 32px; }
  .digit { display: inline-block; width: 24px; height: 24px; overflow: hidden; line-height: 24px; }
  .digit-roll { display: block; animation: digits 360ms steps(10) both; }
  .digit-roll > span { display: block; height: 24px; }
  @keyframes digits { from { transform: translateY(0); } to { transform: translateY(-240px); } }
  @media (prefers-reduced-motion: reduce) {
    .digit-roll { animation: none; transform: translateY(-240px); }
  }
</style>
