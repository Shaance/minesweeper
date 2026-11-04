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
  class:detonated={detonated && shown}
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
  {#if shown && !reduced}<span class="cover" aria-hidden="true"></span>{/if}
  {#if shown}
    {#if value === -1}
      <span class="sprite explosion">{@html renderSprite('boom')}</span>
      <span class="sprite mine-sprite">{@html renderSprite('mine')}</span>
    {:else if value > 0}
      <span class="number">{value}</span>
    {/if}
  {:else if flagged}
    <span class="sprite flag">{@html renderSprite('flag')}</span>
    {#if !reduced}<span class="puff" aria-hidden="true"><i></i><i></i></span>{/if}
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
  .cell.open { border: 1px solid var(--grid); background: var(--open); }
  .cell.detonated { background: var(--pink); animation: flash 240ms steps(1, end) forwards; }
  .cell:focus-visible { outline: 2px solid var(--cyan); outline-offset: -2px; z-index: 2; }
  .number { color: var(--number); font-size: 16px; text-shadow: 0 0 6px currentColor; animation: number var(--fast) steps(2); }
  .sprite { width: 22px; height: 22px; display: block; }
  .sprite :global(svg) { display: block; width: 100%; height: 100%; }
  .flag { color: var(--red); animation: stab 120ms steps(1, end); }
  .explosion, .mine-sprite { position: absolute; }
  .explosion { color: var(--yellow); animation: boomfx 300ms steps(1, end) forwards; }
  .mine-sprite { color: var(--white); animation: minepop var(--fast) steps(2); }
  .cover {
    position: absolute; inset: 0; pointer-events: none;
    background: var(--mid); border: 4px solid;
    border-color: var(--hi) var(--lo) var(--lo) var(--hi);
    animation: crumble 140ms steps(1, end) forwards;
  }
  .puff { position: absolute; inset: 0; pointer-events: none; }
  .puff i {
    position: absolute; bottom: 2px; width: 3px; height: 3px; background: var(--hi);
    animation: pufffx 160ms steps(2, end) forwards;
  }
  .puff i:first-child { left: 30%; }
  .puff i:last-child { right: 30%; animation-delay: 40ms; }
  .cross { position: absolute; inset: 0; pointer-events: none; }
  .cross::before, .cross::after {
    content: ''; position: absolute; left: 50%; top: 50%; width: 100%;
    height: 2px; background: var(--pink); transform: translate(-50%, -50%) rotate(45deg);
  }
  .cross::after { transform: translate(-50%, -50%) rotate(-45deg); }
  @keyframes number { from { transform: scale(1.8); } to { transform: scale(1); } }
  @keyframes crumble {
    0% { transform: scale(1); }
    34% { transform: scale(0.66); }
    67% { transform: scale(0.33); }
    100% { transform: scale(0); }
  }
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
  @media (prefers-reduced-motion: reduce) {
    .cell.open, .number, .flag, .cell.detonated, .cover, .puff, .mine-sprite { animation: none; }
    .cover, .puff, .explosion { display: none; }
  }
</style>
