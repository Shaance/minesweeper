<script lang="ts">
  import { onMount } from 'svelte';
  import type GameBoard from './minesweeper/Board';
  import { createBoard, getBoardAfterPlayerMove } from './minesweeper/BoardManager';
  import { isPlayingState, getDirectionsWithDiagonals } from './minesweeper/BoardHelper';
  import BoardState from './minesweeper/BoardState';
  import BoardInput from './minesweeper/BoardInput';
  import Level from './minesweeper/Level';
  import Hud from './Hud.svelte';
  import LevelPicker from './LevelPicker.svelte';
  import Board from './Board.svelte';
  import Controls from './Controls.svelte';
  import AboutFooter from './AboutFooter.svelte';
  import { playSound } from './sound';

  // Class instances are not deeply proxied by Svelte. Keep the existing methods
  // on a plain object so BoardManager writes go through the state proxy.
  function reactiveBoard(value: GameBoard): GameBoard {
    return Object.assign({}, value, {
      withState: value.withState, withFlagged: value.withFlagged,
    });
  }

  let level = $state(Level.EASY);
  let board = $state(reactiveBoard(createBoard(Level.EASY)));
  let mode = $state(BoardInput.REVEAL);
  let seconds = $state(0);
  let startedAt: number | undefined;
  let game = $state(0);
  let pressed = $state(false);
  let crt = $state(true);
  let sound = $state(false);
  let reduced = $state(false);
  let best = $state<number | null>(null);
  let record = $state(false);
  let announcement = $state('New game');
  let motion = $state({ sequence: 0, delays: {} as Record<number, number>, detonated: -1 });
  const ended = $derived(!isPlayingState(board.state));

  onMount(() => {
    try {
      crt = localStorage.getItem('minesweeper.crt') !== 'false';
      sound = localStorage.getItem('minesweeper.sound') === 'true';
    } catch { /* Storage can be unavailable in private browsing. */ }
    readBest();
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => { reduced = query.matches; };
    syncMotion();
    query.addEventListener('change', syncMotion);
    const timer = window.setInterval(() => {
      if (startedAt !== undefined && !ended) seconds = elapsed();
    }, 200);
    return () => { clearInterval(timer); query.removeEventListener('change', syncMotion); };
  });

  function elapsed() {
    return Math.min(999, Math.floor((performance.now() - startedAt!) / 1000));
  }

  function readBest() {
    try {
      const saved = localStorage.getItem('minesweeper.best.' + level);
      const value = Number(saved);
      best = saved !== null && Number.isInteger(value) && value >= 0 && value <= 999 ? value : null;
    } catch { best = null; }
  }

  function restart(nextLevel = level) {
    level = nextLevel;
    board = reactiveBoard(createBoard(level));
    seconds = 0;
    startedAt = undefined;
    pressed = false;
    record = false;
    motion = { sequence: 0, delays: {}, detonated: -1 };
    game += 1;
    readBest();
    announcement = 'New game';
  }

  function move(row: number, col: number, input: BoardInput) {
    if (ended) return;
    if (input === BoardInput.REVEAL && board.visited[row][col]) input = BoardInput.CHORD;
    if (input === BoardInput.REVEAL && board.flagged[row][col]) return;
    const before = board.visited.map((values) => [...values]);
    const flags = board.availableFlags;
    const remaining = board.remainingNotVisited;
    const result = getBoardAfterPlayerMove(input, board, row, col);
    if (result !== board) {
      board = reactiveBoard(result);
      board.availableFlags = flags;
    }
    const revealed = board.remainingNotVisited !== remaining || board.state === BoardState.LOST;
    if (revealed && startedAt === undefined) startedAt = performance.now();
    if (revealed) {
      const distance = (r: number, c: number) => Math.max(Math.abs(r - row), Math.abs(c - col));
      const mines = board.content.flatMap((values, r) =>
        values.flatMap((value, c) => value === -1 ? [{ r, c }] : []),
      ).sort((a, b) => distance(a.r, a.c) - distance(b.r, b.c));
      const detonated = board.state !== BoardState.LOST ? undefined :
        input === BoardInput.CHORD ? getDirectionsWithDiagonals()
          .map(([r, c]) => ({ r: row + r, c: col + c }))
          .find(({ r, c }) => board.content[r]?.[c] === -1 && !board.flagged[r][c]) :
        { r: row, c: col };
      const origin = detonated ?? { r: row, c: col };
      mines.sort((a, b) =>
        Math.max(Math.abs(a.r - origin.r), Math.abs(a.c - origin.c)) -
        Math.max(Math.abs(b.r - origin.r), Math.abs(b.c - origin.c)),
      );
      const delays: Record<number, number> = {};
      board.visited.forEach((values, r) => values.forEach((visited, c) => {
        if (visited && !before[r][c]) delays[r * board.size + c] = board.content[r][c] === -1
          ? mines.findIndex((mine) => mine.r === r && mine.c === c) * 60
          : distance(r, c) * 25;
      }));
      motion = { sequence: motion.sequence + 1, delays, detonated: detonated ? origin.r * board.size + origin.c : -1 };
    }
    if (ended) {
      seconds = elapsed();
      announcement = board.state === BoardState.WON ? 'You won in ' + seconds + ' seconds' : 'You lost';
      if (board.state === BoardState.WON && (best === null || seconds < best)) {
        best = seconds;
        record = true;
        try { localStorage.setItem('minesweeper.best.' + level, String(best)); } catch { /* Keep the session score. */ }
      }
    }
    if (sound) {
      if (ended) playSound(board.state === BoardState.WON ? 'win' : 'loss');
      else if (flags !== board.availableFlags) playSound('flag');
      else if (revealed) playSound('reveal');
    }
  }

  function toggle(setting: 'crt' | 'sound') {
    if (setting === 'crt') crt = !crt;
    else sound = !sound;
    try { localStorage.setItem('minesweeper.' + setting, String(setting === 'crt' ? crt : sound)); }
    catch { /* The toggle still works for this session. */ }
    if (setting === 'sound' && sound) playSound('flag');
  }
</script>

<svelte:head><title>MINE SWEEPER</title></svelte:head>
{#if crt}<div class="scanlines" class:roll={board.state === BoardState.LOST} aria-hidden="true"></div>{/if}
<main>
  <header>
    <h1>MINE<br />SWEEPER</h1>
    <div class="high-score">
      <span>HI-SCORE</span>
      <strong class:record>{best === null ? '---' : String(best).padStart(3, '0')}</strong>
    </div>
  </header>
  <Hud flags={board.availableFlags} {seconds} state={board.state} {pressed} {reduced} onreset={() => restart()} />
  <LevelPicker {level} onchange={restart} />
  {#key game}
    <Board {board} {mode} {motion} {reduced} onmove={move} onpress={(value) => pressed = value} />
  {/key}
  <Controls {mode} {crt} {sound} onmode={(value) => mode = value} ontoggle={toggle} />
  {#if ended}
    <button class="insert-coin" onclick={() => restart()}>▶ INSERT COIN TO PLAY AGAIN</button>
  {/if}
  <AboutFooter />
  <p class="visually-hidden" aria-live="polite">{announcement}</p>
</main>
