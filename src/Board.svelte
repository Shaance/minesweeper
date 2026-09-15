<script lang="ts">
  import type GameBoard from './minesweeper/Board';
  import BoardInput from './minesweeper/BoardInput';
  import BoardState from './minesweeper/BoardState';
  import Cell from './Cell.svelte';
  import StageClear from './StageClear.svelte';
  let { board, mode, motion, reduced, onmove, onpress }: {
    board: GameBoard; mode: BoardInput;
    motion: { sequence: number; delays: Record<number, number>; detonated: number };
    reduced: boolean;
    onmove: (row: number, col: number, input: BoardInput) => void;
    onpress: (pressed: boolean) => void;
  } = $props();
  let grid: HTMLDivElement;
  let focus = $state(0);
  const ended = $derived(board.state === BoardState.WON || board.state === BoardState.LOST);

  $effect(() => {
    if (!motion.sequence || reduced || !grid) return;
    const lost = board.state === BoardState.LOST;
    const animation = grid.animate(
      lost ? [
        { transform: 'translateX(0)' }, { transform: 'translateX(6px)' },
        { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' },
        { transform: 'translateX(-6px)' }, { transform: 'translateX(0)' },
      ] : [{ transform: 'translateY(1px)' }, { transform: 'translateY(0)' }],
      { duration: lost ? 300 : 60, easing: lost ? 'steps(6)' : 'steps(1)' },
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
          <div role="gridcell">
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
  .board-wrap { position: relative; width: min(100%, calc(var(--size) * 44px + 16px)); margin-inline: auto; }
  .board {
    background: var(--lo); padding: 4px; border: 4px solid var(--hi);
    box-shadow: 0 0 0 4px var(--bg), 0 0 0 8px var(--magenta), 0 0 40px #e879f966;
  }
  .row { display: grid; grid-template-columns: repeat(var(--size), minmax(0, 1fr)); }
  [role='gridcell'] { min-width: 0; aspect-ratio: 1; }
</style>
