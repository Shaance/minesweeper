<script lang="ts">
  import BoardInput from '../minesweeper/BoardInput';
  import BoardState from '../minesweeper/BoardState';
  import Level from '../minesweeper/Level';
  import type GameBoard from '../minesweeper/Board';
  import { createBoard, getBoardAfterPlayerMove } from '../minesweeper/BoardManager';
  import Board from '../Board.svelte';
  import LevelPicker from '../LevelPicker.svelte';

  type Variant = 'swap' | 'fade' | 'slide' | 'deal';
  let { variant }: { variant: Variant } = $props();

  function reactiveBoard(value: GameBoard): GameBoard {
    return Object.assign({}, value, {
      withState: value.withState, withFlagged: value.withFlagged,
    });
  }

  let level = $state(Level.EASY);
  let board = $state(reactiveBoard(createBoard(Level.EASY)));
  let game = $state(0);
  const motion = { sequence: 0, delays: {} as Record<number, number>, detonated: -1,
    origin: null as { r: number; c: number } | null };

  function move(row: number, col: number, input: BoardInput) {
    if (board.state !== BoardState.INITIAL && board.state !== BoardState.PLAYING) return;
    if (input === BoardInput.REVEAL && board.visited[row][col]) input = BoardInput.CHORD;
    if (input === BoardInput.REVEAL && board.flagged[row][col]) return;
    board = reactiveBoard(getBoardAfterPlayerMove(input, board, row, col));
  }

  // Switching level remounts the board (new key), which replays the deal-in;
  // the frame animation comes from the variant class on the wrapper.
  function change(next: Level) {
    level = next;
    board = reactiveBoard(createBoard(next));
    game += 1;
  }
</script>

<div class="twrap" class:swap={variant === 'swap'} class:fade={variant === 'fade'}
  class:slide={variant === 'slide'} class:deal={variant === 'deal'}>
  <LevelPicker {level} onchange={change} />
  {#key game}
    <Board {board} mode={BoardInput.REVEAL} {motion} reduced={false} onmove={move} onpress={() => {}} />
  {/key}
</div>

<style>
  .twrap :global(.levels) { margin-bottom: 20px; }
  .twrap :global(.board-wrap) { width: calc(var(--size) * 44px + 16px); }
  /* T1 — what ships today: frame scale+fade, then the deal-in. */
  .twrap.swap :global(.board-wrap) { animation: tswap var(--fast) steps(2, end); }
  @keyframes tswap { from { transform: scale(.94); opacity: .35; } to { transform: scale(1); opacity: 1; } }
  /* T2 — frame fades only. */
  .twrap.fade :global(.board-wrap) { animation: tfade var(--fast) steps(2, end); }
  @keyframes tfade { from { opacity: 0; } to { opacity: 1; } }
  /* T3 — frame slides in from the right. */
  .twrap.slide :global(.board-wrap) { animation: tslide 160ms steps(3, end); }
  @keyframes tslide { from { transform: translateX(28px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  /* T4 — deal-in only, no frame animation (the old behaviour). */
  .twrap.deal :global(.board-wrap) { animation: none; }
</style>
