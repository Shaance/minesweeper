<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import BoardInput from './minesweeper/BoardInput';
  import { renderSprite } from './sprites';
  let { value, row, col, visited, flagged, lost, ended, mode, reduced, delay, detonated,
    tabindex, onfocus, onpress, onmove }: {
    value: number; row: number; col: number; visited: boolean; flagged: boolean;
    lost: boolean; ended: boolean; mode: BoardInput; reduced: boolean; delay: number;
    detonated: boolean; tabindex: number; onfocus: () => void;
    onpress: (pressed: boolean) => void; onmove: (input: BoardInput) => void;
  } = $props();
  let shown = $state(false);
  let pressed = $state(false);
  let suppressClick = false;
  let hold: ReturnType<typeof setTimeout> | undefined;
  const wrong = $derived(lost && flagged && value !== -1);
  const label = $derived(visited ? (value === -1 ? 'mine' : value === 0 ? 'empty' : String(value)) :
    flagged ? 'flagged' : 'hidden');
  const colors = ['hi', 'cyan', 'lime', 'pink', 'yellow', 'orange', 'magenta', 'white', 'hi'];

  $effect(() => {
    if (!visited) { shown = false; return; }
    const wait = reduced ? 0 : untrack(() => delay);
    if (wait === 0) { shown = true; return; }
    const arrival = setTimeout(() => shown = true, wait);
    return () => clearTimeout(arrival);
  });

  function cancelPress() {
    clearTimeout(hold);
    pressed = false;
    onpress(false);
  }

  function pointerdown(event: PointerEvent) {
    if (ended || event.button !== 0) return;
    suppressClick = false;
    pressed = true;
    onpress(true);
    hold = setTimeout(() => {
      suppressClick = true;
      onmove(BoardInput.FLAG);
    }, 400);
  }

  function click(event: MouseEvent) {
    if (!suppressClick) onmove(event.detail === 0 || visited ? BoardInput.REVEAL : mode);
    suppressClick = false;
  }

  function keydown(event: KeyboardEvent) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (ended || event.repeat) return;
      if (event.key === 'Enter') onmove(BoardInput.REVEAL);
      else { pressed = true; onpress(true); }
    } else if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      if (!event.repeat) onmove(BoardInput.FLAG);
    }
  }

  function keyup(event: KeyboardEvent) {
    if (event.key !== ' ') return;
    event.preventDefault();
    if (pressed) onmove(BoardInput.REVEAL);
    cancelPress();
  }

  onDestroy(() => clearTimeout(hold));
</script>

<button class="cell" class:open={shown} class:pressed={pressed && !shown} class:wrong
  class:detonated={detonated && shown} class:mine={value === -1 && shown}
  style={'--number: var(--' + colors[Math.max(0, value)] + ')'}
  aria-label={'row ' + (row + 1) + ' column ' + (col + 1) + ', ' + label}
  aria-disabled={ended} {tabindex} {onfocus} onclick={click}
  onpointerdown={pointerdown} onpointerup={cancelPress} onpointerleave={cancelPress}
  onpointercancel={() => { suppressClick = true; cancelPress(); }}
  oncontextmenu={(event) => {
    event.preventDefault();
    if (!suppressClick) onmove(BoardInput.FLAG);
    cancelPress();
  }}
  onkeydown={keydown} onkeyup={keyup} onblur={cancelPress}>
  {#if shown}
    {#if value === -1}
      <span class="sprite explosion">{@html renderSprite('boom')}</span>
      <span class="sprite mine-sprite">{@html renderSprite('mine')}</span>
    {:else if value > 0}
      <span class="number">{value}</span>
    {/if}
  {:else if flagged}
    <span class="sprite flag">{@html renderSprite('flag')}</span>
  {/if}
  {#if wrong}<span class="cross" aria-hidden="true"></span>{/if}
</button>

<style>
  .cell {
    position: relative; display: grid; place-items: center; width: 100%; height: 100%;
    min-width: 0; padding: 0; border: 4px solid;
    border-color: var(--hi) var(--lo) var(--lo) var(--hi);
    background: var(--mid); touch-action: manipulation; -webkit-touch-callout: none;
  }
  @media (hover: hover) { .cell:not(.open):hover { background: #7c4fe6; } }
  .cell.pressed { border-color: var(--lo) var(--hi) var(--hi) var(--lo); }
  .cell.open { border: 1px solid var(--grid); background: var(--open); animation: arrival var(--fast) steps(1); }
  .cell.detonated { background: var(--pink); }
  .cell.mine { animation: none; }
  .cell:focus-visible { outline: 2px solid var(--cyan); outline-offset: -2px; z-index: 2; }
  .number { color: var(--number); font-size: 16px; text-shadow: 0 0 6px currentColor; animation: number var(--fast) steps(2); }
  .sprite { width: 22px; height: 22px; display: block; }
  .sprite :global(svg) { display: block; width: 100%; height: 100%; }
  .flag { color: var(--red); animation: number var(--fast) steps(2); }
  .explosion, .mine-sprite { position: absolute; }
  .explosion { color: var(--yellow); animation: boom var(--fast) steps(1, end) forwards; }
  .mine-sprite { color: var(--white); animation: mine var(--fast) steps(1, end) both; }
  .cross { position: absolute; inset: 0; pointer-events: none; }
  .cross::before, .cross::after {
    content: ''; position: absolute; left: 50%; top: 50%; width: 100%;
    height: 2px; background: var(--pink); transform: translate(-50%, -50%) rotate(45deg);
  }
  .cross::after { transform: translate(-50%, -50%) rotate(-45deg); }
  @keyframes arrival { from { background: #22d3ee99; } to { background: var(--open); } }
  @keyframes number { from { transform: scale(1.4); } to { transform: scale(1); } }
  @keyframes boom { from { visibility: visible; } to { visibility: hidden; } }
  @keyframes mine { from { visibility: hidden; } to { visibility: visible; } }
  @media (prefers-reduced-motion: reduce) {
    .cell.open, .number, .flag { animation: none; }
    .explosion { animation: boom var(--fast) steps(1, end) forwards; }
    .mine-sprite { animation: mine var(--fast) steps(1, end) both; }
  }
</style>
