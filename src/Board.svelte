<script lang="ts">
  import { untrack } from 'svelte';
  import type GameBoard from './minesweeper/Board';
  import BoardInput from './minesweeper/BoardInput';
  import BoardState from './minesweeper/BoardState';
  import Cell from './Cell.svelte';
  import StageClear from './StageClear.svelte';
  let { board, mode, motion, reduced, onmove, onpress }: {
    board: GameBoard; mode: BoardInput;
    motion: { sequence: number; delays: Record<number, number>; detonated: number;
      origin: { r: number; c: number } | null };
    reduced: boolean;
    onmove: (row: number, col: number, input: BoardInput) => void;
    onpress: (pressed: boolean) => void;
  } = $props();
  let grid: HTMLDivElement;
  let focus = $state(0);
  const ended = $derived(board.state === BoardState.WON || board.state === BoardState.LOST);
  const won = $derived(board.state === BoardState.WON);
  const origin = $derived(motion.origin ?? { r: board.size >> 1, c: board.size >> 1 });
  const dealDelay = (r: number, c: number) =>
    Math.max(Math.abs(r - (board.size >> 1)), Math.abs(c - (board.size >> 1))) * 25;
  const hopDelay = (r: number, c: number) =>
    Math.max(Math.abs(r - origin.r), Math.abs(c - origin.c)) * 40;
  // Deal-in is timer-driven (same idiom as Cell's reveal delay) so the settled
  // scale(1) is a plain base style — no reliance on animation fill modes, which
  // WebKit mishandles during animation-delay.
  let dealt = $state<Record<number, boolean>>({});
  $effect(() => {
    if (reduced) return;
    return untrack(() => {
      const timers: ReturnType<typeof setTimeout>[] = [];
      for (let r = 0; r < board.size; r++) for (let c = 0; c < board.size; c++) {
        const i = r * board.size + c;
        if (!dealt[i]) timers.push(setTimeout(() => { dealt[i] = true; }, dealDelay(r, c)));
      }
      return () => timers.forEach(clearTimeout);
    });
  });

  $effect(() => {
    if (!motion.sequence || reduced || !grid) return;
    if (board.state !== BoardState.LOST) return;
    const animation = grid.animate(
      [0, 8, -8, 6, -4, 2, 0].map((x) => ({ transform: 'translateX(' + x + 'px)' })),
      { duration: 360, easing: 'steps(1, end)' },
    );
    return () => animation.cancel();
  });

  function navigate(event: KeyboardEvent) {
    const row = Math.floor(focus / board.size);
    const col = focus % board.size;
    let next = focus;
    if (event.key === 'ArrowUp') next = Math.max(0, row - 1) * board.size + col;
    else if (event.key === 'ArrowDown') next = Math.min(board.size - 1, row + 1) * board.size + col;
    else if (event.key === 'ArrowLeft') next = row * board.size + Math.max(0, col - 1);
    else if (event.key === 'ArrowRight') next = row * board.size + Math.min(board.size - 1, col + 1);
    else return;
    event.preventDefault();
    focus = next;
    grid.querySelectorAll<HTMLButtonElement>('.cell')[next].focus();
  }
</script>

<div class="board-wrap" style={'--size: ' + board.size}>
  <div class="board" role="grid" tabindex="-1" aria-label="Minesweeper board" aria-describedby="keyboard-help"
    aria-rowcount={board.size} aria-colcount={board.size} bind:this={grid}
    onkeydown={navigate} oncontextmenu={(event) => event.preventDefault()}>
    {#each board.content as row, r}
      <div class="row" role="row">
        {#each row as value, c}
          {@const index = r * board.size + c}
          <div role="gridcell" class:predeal={!reduced && !dealt[index]} class:dealt={!reduced && dealt[index]}
            class:hop={won && !reduced} style={'--h: ' + hopDelay(r, c) + 'ms'}>
            <Cell {value} row={r} col={c} visited={board.visited[r][c]} flagged={board.flagged[r][c]}
              lost={board.state === BoardState.LOST} {ended} {mode} {reduced}
              delay={motion.delays[index] ?? 0} detonated={motion.detonated === index}
              tabindex={focus === index ? 0 : -1} onfocus={() => focus = index}
              {onpress} onmove={(input) => onmove(r, c, input)} />
          </div>
        {/each}
      </div>
    {/each}
  </div>
  {#if board.state === BoardState.WON}<StageClear {reduced} />{/if}
</div>

<style>
  .board-wrap {
    position: relative;
    width: min(100%, calc(var(--size) * var(--cell, 44px) + 16px)); margin-inline: auto;
    animation: swapin var(--fast) steps(2, end);
  }
  @keyframes swapin {
    from { transform: scale(.94); opacity: .35; }
    to { transform: scale(1); opacity: 1; }
  }
  .board {
    background: var(--lo); padding: 4px; border: 4px solid var(--hi);
    box-shadow: 0 0 0 4px var(--bg), 0 0 0 8px var(--magenta), 0 0 40px #e879f966;
  }
  .row { display: grid; grid-template-columns: repeat(var(--size), minmax(0, 1fr)); }
  [role='gridcell'] { min-width: 0; aspect-ratio: 1; }
  [role='gridcell'].predeal { transform: scale(0.55); }
  [role='gridcell'].dealt { transform: scale(1); animation: deal var(--fast) steps(2, end); }
  [role='gridcell'].hop { animation: hop 200ms steps(1, end) both; animation-delay: var(--h); }
  @keyframes deal { from { transform: scale(0.55); } to { transform: scale(1); } }
  @keyframes hop {
    0% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
    100% { transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .board-wrap, [role='gridcell'].dealt, [role='gridcell'].hop { animation: none; }
  }
</style>
