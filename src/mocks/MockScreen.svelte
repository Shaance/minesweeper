<script lang="ts">
  import BoardInput from '../minesweeper/BoardInput';
  import BoardState from '../minesweeper/BoardState';
  import Level from '../minesweeper/Level';
  import type GameBoard from '../minesweeper/Board';
  import { createBoard, getBoardAfterPlayerMove } from '../minesweeper/BoardManager';
  import Board from '../Board.svelte';
  import Hud from '../Hud.svelte';
  import LevelPicker from '../LevelPicker.svelte';
  import Controls from '../Controls.svelte';
  import AboutFooter from '../AboutFooter.svelte';

  type Layout = 'before-phone' | 'before-wide' | 'side';
  let { layout, width, height, cell = 44, rail = 'right', railWidth = 320 }: {
    layout: Layout; width: number; height: number; cell?: number;
    rail?: 'left' | 'right'; railWidth?: number;
  } = $props();

  // Same plain-object wrap as App.svelte so Svelte proxies the board deeply.
  function reactiveBoard(value: GameBoard): GameBoard {
    return Object.assign({}, value, {
      withState: value.withState, withFlagged: value.withFlagged,
    });
  }

  // A mid-game board: one flood fill, a second reveal, two flags.
  function sampleBoard(nextLevel: Level = Level.MEDIUM): GameBoard {
    const board = reactiveBoard(createBoard(nextLevel));
    getBoardAfterPlayerMove(BoardInput.REVEAL, board, 5, 5);
    getBoardAfterPlayerMove(BoardInput.REVEAL, board, 8, 1);
    getBoardAfterPlayerMove(BoardInput.FLAG, board, 0, board.size - 1);
    getBoardAfterPlayerMove(BoardInput.FLAG, board, board.size - 1, 0);
    if (board.state === BoardState.INITIAL) board.state = BoardState.PLAYING;
    return board;
  }

  let board = $state(sampleBoard());
  let level = $state(Level.MEDIUM);
  let mode = $state(BoardInput.REVEAL);
  let crt = $state(true);
  let sound = $state(false);
  let seconds = $state(37);
  const motion = { sequence: 0, delays: {} as Record<number, number>, detonated: -1,
    origin: null as { r: number; c: number } | null };
  // Reduced motion so the mock renders settled: no deal-in timers, no crumble.
  const reduced = true;

  function move(row: number, col: number, input: BoardInput) {
    if (board.state !== BoardState.INITIAL && board.state !== BoardState.PLAYING) return;
    if (input === BoardInput.REVEAL && board.visited[row][col]) input = BoardInput.CHORD;
    if (input === BoardInput.REVEAL && board.flagged[row][col]) return;
    board = reactiveBoard(getBoardAfterPlayerMove(input, board, row, col));
  }

  function setMode(value: BoardInput) { mode = value; }

  function onKeydown(event: KeyboardEvent) {
    if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key.toLowerCase() !== 'm') return;
    event.preventDefault();
    setMode(mode === BoardInput.REVEAL ? BoardInput.FLAG : BoardInput.REVEAL);
  }

  function toggle(setting: 'crt' | 'sound') {
    if (setting === 'crt') crt = !crt; else sound = !sound;
  }

  const railLeft = $derived(rail === 'left');
  const roomy = $derived(railWidth >= 400);
</script>

<svelte:window onkeydown={onKeydown} />

<div class="screen" style={'width: ' + width + 'px; height: ' + height + 'px; --cell: ' + cell + 'px'}>
  {#if crt}<div class="crt-overlay" aria-hidden="true"></div>{/if}

  {#if layout === 'side'}
    <div class="side" class:rail-left={railLeft} class:roomy={roomy} style={'--rail-w: ' + railWidth + 'px'}>
      <div class="board-col">
        <Board {board} {mode} {motion} {reduced} onmove={move} onpress={() => {}} />
      </div>
      <aside class="rail">
        <header>
          <h1>MINE<br />SWEEPER</h1>
          <div class="high-score"><span>HI-SCORE</span><strong>042</strong></div>
        </header>
        <Hud flags={board.availableFlags} {seconds} boardState={board.state} pressed={false}
          {reduced} onreset={() => { board = sampleBoard(level); seconds = 0; }} />
        <div class="deck">
          <LevelPicker {level} onchange={(value) => { level = value; board = sampleBoard(value); }} />
          <Controls {mode} {crt} {sound} onmode={setMode} ontoggle={toggle} />
        </div>
        <AboutFooter />
      </aside>
    </div>
  {:else}
    <main class="col">
      <header>
        <h1>MINE<br />SWEEPER</h1>
        <div class="high-score"><span>HI-SCORE</span><strong>042</strong></div>
      </header>
      <Hud flags={board.availableFlags} {seconds} boardState={board.state} pressed={false}
        {reduced} onreset={() => { board = sampleBoard(level); seconds = 0; }} />
      <LevelPicker {level} onchange={(value) => { level = value; board = sampleBoard(value); }} />
      <Board {board} {mode} {motion} {reduced} onmove={move} onpress={() => {}} />
      <Controls {mode} {crt} {sound} onmode={setMode} ontoggle={toggle} />
      <AboutFooter />
    </main>
  {/if}
</div>

<style>
  .screen { position: relative; overflow: hidden; background: var(--bg); color: var(--hi); }
  .crt-overlay {
    position: absolute; inset: 0; z-index: 10; pointer-events: none;
    background: repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 2px, transparent 2px 4px);
  }
  /* The cabinet (board + panel) is one object: the row hugs the board's
     height, the rail stretches to match it, and the whole thing centres
     vertically in the frame. */
  .side {
    position: relative; height: 100%; padding: 40px;
    display: grid; grid-template-columns: auto var(--rail-w, 320px); gap: 48px;
    justify-content: center; align-content: center;
  }
  .side.rail-left { grid-template-columns: var(--rail-w, 320px) auto; }
  .side.rail-left .rail { order: -1; }
  /* Board and panel share the same height; the rail is one tonal slab whose
     four grouped sections (brand / status / deck / footer) distribute evenly,
     and the deck keeps levels + controls + hints tight. */
  .board-col { align-self: center; }
  .rail {
    display: flex; flex-direction: column; justify-content: space-between;
    background: var(--panel); border: 2px solid var(--mid); padding: 28px;
  }
  /* Brand row: title left, HI-SCORE pinned to the top right corner, always on
     one line — the title shrinks in the narrow rail so the row fits. */
  .rail header { flex-wrap: nowrap; align-items: flex-start; }
  .rail h1 { font-size: 24px; }
  .rail .high-score { gap: 16px; }
  .rail .high-score strong { font-size: 16px; }
  .side.roomy .rail h1 { font-size: 28px; }
  .rail :global(.hud) { margin: 0; }
  .deck :global(.levels) { margin-bottom: 20px; }
  .deck :global(.controls) { margin-top: 20px; gap: 10px; }
  /* One hint per line in the rail — no mid-phrase wraps. */
  .deck :global(.hints) { margin: 16px 0 0; line-height: 2.2; }
  .deck :global(.pointer-hints) { flex-direction: column; gap: 6px; }
  .rail :global(footer) { margin: 0; text-align: left; }
  /* Wide rail: roomier controls, since the width allows it. */
  .side.roomy .rail :global(.led) { font-size: 26px; min-width: 112px; height: 60px; padding: 14px 10px; }
  .side.roomy .rail :global(.face) { width: 64px; height: 64px; }
  .side.roomy .deck :global(.levels button) { min-height: 48px; font-size: 11px; }
  .side.roomy .deck :global(.controls button) { min-height: 52px; font-size: 10px; }
  /* Fixed pixel width: min(100%, …) is circular inside the auto-sized grid
     column of the side layout and collapses the board. */
  .side :global(.board-wrap) { width: calc(var(--size) * var(--cell, 44px) + 16px); }
</style>
