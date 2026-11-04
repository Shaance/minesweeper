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
  import { playSound, stopSound } from './sound';

  // Class instances are not deeply proxied by Svelte. Keep the existing methods
  // on a plain object so BoardManager writes go through the state proxy.
  function reactiveBoard(value: GameBoard): GameBoard {
    return Object.assign({}, value, {
      withState: value.withState, withFlagged: value.withFlagged,
    });
  }

  function readLevel(): Level {
    try {
      const saved = localStorage.getItem('minesweeper.level');
      if (saved === Level.EASY || saved === Level.MEDIUM || saved === Level.HARD) return saved;
    } catch { /* Storage can be unavailable in private browsing. */ }
    return Level.EASY;
  }

  const initialLevel = readLevel();
  let level = $state(initialLevel);
  let board = $state(reactiveBoard(createBoard(initialLevel)));
  let mode = $state(BoardInput.REVEAL);
  let seconds = $state(0);
  let startedAt: number | undefined;
  let hiddenAt: number | undefined;

  function buzz(pattern: number | number[]) {
    try { navigator.vibrate?.(pattern); } catch { /* Vibration unsupported. */ }
  }
  let game = $state(0);
  let pressed = $state(false);
  let crt = $state(true);
  let sound = $state(false);
  let reduced = $state(false);
  // Wide viewports get the side-cabinet layout (board left, control rail
  // right); narrow ones keep the single column.
  let wide = $state(false);
  let best = $state<number | null>(null);
  let record = $state(false);
  let announcement = $state('New game');
  let motion = $state({ sequence: 0, delays: {} as Record<number, number>, detonated: -1,
    origin: null as { r: number; c: number } | null });
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
    const wideQuery = matchMedia('(min-width: 1024px)');
    const syncWide = () => { wide = wideQuery.matches; };
    syncWide();
    wideQuery.addEventListener('change', syncWide);
    const timer = window.setInterval(() => {
      if (startedAt !== undefined && !ended) seconds = elapsed();
    }, 200);
    // Safari can leave a backgrounded context stuck; the next move creates a fresh one.
    // While hidden, the clock is paused so background time does not count.
    const onVisibility = () => {
      if (document.hidden) {
        hiddenAt = performance.now();
        stopSound();
      } else if (hiddenAt !== undefined) {
        if (startedAt !== undefined && !ended) startedAt += performance.now() - hiddenAt;
        hiddenAt = undefined;
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(timer);
      query.removeEventListener('change', syncMotion);
      wideQuery.removeEventListener('change', syncWide);
      document.removeEventListener('visibilitychange', onVisibility);
      stopSound();
    };
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
    try { localStorage.setItem('minesweeper.level', nextLevel); }
    catch { /* The choice still applies for this session. */ }
    board = reactiveBoard(createBoard(level));
    seconds = 0;
    startedAt = undefined;
    pressed = false;
    record = false;
    motion = { sequence: 0, delays: {}, detonated: -1, origin: null };
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
      motion = { sequence: motion.sequence + 1, delays,
        detonated: detonated ? origin.r * board.size + origin.c : -1, origin };
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
    if (ended) buzz(board.state === BoardState.WON ? [40, 60, 40] : 80);
    else if (flags !== board.availableFlags) buzz(12);
  }

  function setMode(value: BoardInput) {
    mode = value;
    announcement = value === BoardInput.FLAG ? 'Flag mode' : 'Reveal mode';
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key.toLowerCase() !== 'm') return;
    event.preventDefault();
    setMode(mode === BoardInput.REVEAL ? BoardInput.FLAG : BoardInput.REVEAL);
  }

  function toggle(setting: 'crt' | 'sound') {
    if (setting === 'crt') crt = !crt;
    else sound = !sound;
    try { localStorage.setItem('minesweeper.' + setting, String(setting === 'crt' ? crt : sound)); }
    catch { /* The toggle still works for this session. */ }
    if (setting === 'sound') {
      if (sound) playSound('flag');
      else stopSound();
    }
  }
</script>

<svelte:head><title>MINE SWEEPER</title></svelte:head>
<svelte:window onkeydown={onKeydown} />
{#if crt}<div class="scanlines" class:roll={board.state === BoardState.LOST} aria-hidden="true"></div>{/if}
{#if wide}
  <main class="wide">
    <div class="board-col">
      {#key game}
        <Board {board} {mode} {motion} {reduced} onmove={move} onpress={(value) => pressed = value} />
      {/key}
    </div>
    <aside class="rail">
      <header>
        <h1>MINE<br />SWEEPER</h1>
        <div class="high-score">
          <span>HI-SCORE</span>
          <strong class:record>{best === null ? '---' : String(best).padStart(3, '0')}</strong>
        </div>
      </header>
      <Hud flags={board.availableFlags} {seconds} boardState={board.state} {pressed} {reduced} onreset={() => restart()} />
      <div class="deck">
        <LevelPicker {level} onchange={restart} />
        <Controls {mode} {crt} {sound} onmode={setMode} ontoggle={toggle} />
      </div>
      {#if ended}
        <button class="insert-coin" onclick={() => restart()}>▶ INSERT COIN TO PLAY AGAIN</button>
      {/if}
      <AboutFooter />
    </aside>
  </main>
{:else}
  <main>
    <header>
      <h1>MINE<br />SWEEPER</h1>
      <div class="high-score">
        <span>HI-SCORE</span>
        <strong class:record>{best === null ? '---' : String(best).padStart(3, '0')}</strong>
      </div>
    </header>
    <Hud flags={board.availableFlags} {seconds} boardState={board.state} {pressed} {reduced} onreset={() => restart()} />
    <LevelPicker {level} onchange={restart} />
    {#key game}
      <Board {board} {mode} {motion} {reduced} onmove={move} onpress={(value) => pressed = value} />
    {/key}
    <Controls {mode} {crt} {sound} onmode={setMode} ontoggle={toggle} />
    {#if ended}
      <button class="insert-coin" onclick={() => restart()}>▶ INSERT COIN TO PLAY AGAIN</button>
    {/if}
    <AboutFooter />
  </main>
{/if}
<p class="visually-hidden" aria-live="polite">{announcement}</p>
