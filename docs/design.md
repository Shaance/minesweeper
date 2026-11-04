# Minesweeper, arcade edition

Design contract for the 2026 rebuild of minesweeper.hashcode.dev. The chosen direction is the "Arcade" mock: a near-black cabinet, neon purple bevels, one neon colour per number, red LED counters and optional CRT scanlines. Everything below is authoritative; anything not covered follows the simplest reading of the mock.

## Stack

- Svelte 5 (runes), Vite, TypeScript, vitest. Same versions as the sibling repo `svelte-image-converter` (Svelte 5.57, Vite 8.3, TS 6, vitest 5, `@sveltejs/vite-plugin-svelte` 7.3).
- Node 24 (`.nvmrc` 24, `engines.node` 24.x in package.json). Vercel builds from `master`; `vercel.json` declares `"framework": "vite"` because the project preset is still the old rollup Svelte template.
- Game logic in `src/minesweeper/` stays as is apart from the additions listed under "Logic changes". Rollup, jasmine, Cypress, ts-node, eslint config, Dockerfile and docker-compose are removed. The GitHub Action runs `npm ci`, `npm run check`, `npm test`, `npm run build` on Node 24 and no longer targets a Vercel preview URL.

## Logic changes

- `getBoardAfterPlayerMove` grows a third input mode `BoardInput.CHORD`: on a revealed number cell whose adjacent flag count equals its number, reveal every hidden, unflagged neighbour (each through the same code path as a normal reveal, so a wrongly flagged mine still loses). On any other cell it is a no-op.
- Board mutation stays in place (the current functions mutate and return the same object). The UI holds the board in a Svelte 5 `$state` so those mutations are reactive.
- Unit tests port from jasmine to vitest with the same cases, plus cases for chording (reveals neighbours, no-op when flag count differs, loses when a flag is wrong).

## Layout

One centred column, max width 480px, on `--bg`. From top:

1. Title "MINE SWEEPER" on two lines, Press Start 2P, cyan with a magenta 4px offset shadow and a `--lo` 8px shadow. Right of it, small "HI-SCORE" in lime with the best time for the current level in yellow (from localStorage, `---` when none).
2. HUD row: LED flag counter (flags remaining, 3 digits), face button, LED timer (seconds, 3 digits, capped at 999).
3. Level row: EASY, MEDIUM, HARD buttons. Selected one is cyan with `--bg` text and a 4px `--lo` hard shadow; others are `--panel` with `--hi` text and a 2px `--mid` border.
4. Board: `--lo` background, 4px padding, 4px `--hi` border, outer ring `0 0 0 4px --bg, 0 0 0 8px --magenta` and a `0 0 40px` magenta glow at 40% alpha. Cells are square, size = min(44px, (column width - padding) / n).
5. Controls row under the board, Press Start 2P 9px in `--hi`: a REVEAL / FLAG mode toggle (two segmented buttons, the active one cyan), a CRT toggle, a SOUND toggle. Hints line: "CLICK · REVEAL   RIGHT-CLICK / HOLD · FLAG" on pointer devices.
6. After a game ends, a blinking magenta line "▶ INSERT COIN TO PLAY AGAIN" (1s step blink, no fade). It is a button; activating it starts a new game at the same level. The face button does the same at any time. In the wide side-cabinet rail the button always holds its slot (`visibility: hidden` while playing) so the rail never shifts when a game ends.
7. Footer: "Code on GitHub" link in `--hi`, 9px.

The whole page carries the scanline overlay when CRT is on: a fixed, pointer-events-none `repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 2px, transparent 2px 4px)`. CRT defaults to on, remembered in localStorage.

At 375px wide the 12 by 12 board must fit with cells of at least 28px, and every control stays reachable without horizontal scroll. The mode toggle is the primary flag affordance on touch, long-press is the second.

Large displays (viewport >= 1024px wide) use the side-cabinet layout (variant A1 from the dev-only `?mocks` page, `src/mocks/`): board left, control rail right as a `--panel` slab exactly as tall as the board, the pair centred in the viewport. The rail distributes four groups — brand (title left, HI-SCORE pinned top-right), HUD, a deck of level picker + controls + hints (one hint per line), footer. Cells are 48px, growing to 56px at >= 1280px (`--cell` on the board wrap, default 44px in the column layout). The `?lab` and `?mocks` pages stay gated behind `import.meta.env.DEV` and are not shipped in production builds.

## Palette and type

```
--bg      #0b0a1e   page and cabinet
--panel   #161437   inactive buttons
--hi      #a78bfa   light bevel, secondary text
--mid     #6d3fd6   hidden tile face
--lo      #2e1065   dark bevel, board background
--open    #101028   revealed tile
--grid    #1f1d47   1px border around revealed tiles
--cyan    #22d3ee   number 1, title, selected controls
--lime    #a3e635   number 2, HI-SCORE label
--pink    #f43f5e   number 3
--yellow  #facc15   number 4, face sprite, hi-score value
--orange  #fb923c   number 5
--magenta #e879f9   number 6, glow, INSERT COIN
--white   #f8f8ff   number 7, mine sprite
--red     #ff2d55   flag sprite, LED digits
```

Number 8 uses `--hi`. Numbers have `text-shadow: 0 0 6px currentColor`. LED counters: black background, 2px `--lo` border, red digits with `0 0 8px` red glow, Press Start 2P 22px, letter-spacing 2px.

Font: Press Start 2P from Google Fonts (`<link>` in index.html with preconnect), fallback `monospace`. Sizes: title 34px, LED 22px, numbers 16px, level buttons 10px, controls and hints 9px. Everything is uppercase by content, not CSS.

## Tiles

- Hidden: `--mid` face, 4px bevel (top and left `--hi`, right and bottom `--lo`).
- Pressed (pointer down on a hidden tile, or the focused tile while Space is held): bevel inverted (top and left `--lo`, right and bottom `--hi`), no transition.
- Revealed: `--open` with 1px `--grid` border, number centred, empty tiles blank.
- Flagged: hidden tile with the flag sprite, 22px, in `--red`.
- Mine (after loss): revealed tile with the mine sprite in `--white`, the mine that was clicked has a `--pink` background.
- Wrong flag (after loss): flagged tile with a 2px `--pink` cross over the flag.

Sprites are 8 by 8 pixel maps rendered as inline SVG `<rect>`s with `shape-rendering: crispEdges`, sized in whole multiples where possible. One TypeScript module holds the maps below and a render function; the face button uses the same mechanism at 32px in `--yellow` with `--bg` features.

```
flag     ...##...  ...####.  ...#####  ...####.  ...##...  ...#....  .####...  ######..
mine     ...##...  .#.##.#.  ..####..  #######.  ##o####.  ..####..  .#.##.#.  ...##...   (o = --bg highlight)
boom     #..#..#.  .#.#.#..  ..###...  #######.  ..###...  .#.#.#..  #..#..#.  ........
face     ..####..  .######.  ##e##e##  ########  ##m##m##  ###mm###  .######.  ..####..
worried  ..####..  .######.  ##e##e##  ########  ###mm###  ##m##m##  .######.  ..####..
dead     ..####..  .######.  #x#xx#x#  ##x##x##  #x#xx#x#  ##mmmm##  .######.  ..####..
cool     ..####..  .######.  ssssssss  #ss##ss#  ########  ##m##m##  .#mmmm#.  ..####..
```

`#` is the main colour; `e`, `m`, `x`, `s` are the feature colour (`--bg` on the face).

## Interaction

- Pointer: primary click follows the mode toggle (reveals in REVEAL, flags in FLAG). Right-click always flags. A 400ms press does the opposite of the mode (flags in REVEAL, reveals in FLAG). Clicking a revealed number chords. `contextmenu` is suppressed on the board. A long-press must not also trigger the tap action on release.
- Keyboard: the board is a grid with roving tabindex. Arrow keys move focus (wrapping is not required), Enter or Space reveals (chords on a number), F flags, M toggles the REVEAL/FLAG mode (same as the mode buttons, announced in the live region), 1/2/3 switch to EASY/MEDIUM/HARD. Focus ring: 2px `--cyan` outline, offset -2px, visible only for `:focus-visible`.
- Face button: normal face while idle or playing, worried while any tile is pressed, dead after loss, cool after win. Clicking it starts a new game.
- Timer starts on the first reveal, stops on win or loss, resets on new game or level change, and pauses while the tab is hidden (background time never counts). Level change starts a new board immediately; the chosen level is remembered in localStorage key `minesweeper.level`.
- Haptics: where the device supports it, a 12ms vibration on flag and a short pattern on game end (80ms loss, 40/60/40ms win). Purely additive; no setting.
- On win, every mine is auto-flagged (flag stab animation) and the flag counter reads 000.
- Hi-score: best time per level in localStorage key `minesweeper.best.<LEVEL>`. Updated on win; the HI-SCORE value flashes cyan once when beaten.
- Sound: WebAudio square-wave blips, muted by default, toggle remembered in localStorage. Reveal 880Hz 40ms, flag 440Hz 40ms, loss a descending 3-note run, win an ascending 4-note run. No audio files.
- Every control is a real `<button>`. Cells carry `aria-label` "row R column C, hidden | flagged | N | empty | mine". A visually hidden `aria-live="polite"` region announces "You won in N seconds", "You lost" and "New game".

## Motion

Timing tokens on `:root`: `--fast: 120ms`, `--ring: 25ms`, `--shake: 60ms`. Easing `steps()` or linear only; no smooth easing curves anywhere, the piece is 8-bit.

- Tile press: bevel inverts on pointerdown with no transition.
- New game (including level change): the board frame swaps in with a 120ms scale 0.94 → 1 / opacity 0.35 → 1 (`--fast`, `steps(2)`) on the board wrap (alternative frame transitions are mocked on the dev-only `?mocks` page), while the board deals in from the centre outward — each Chebyshev ring starts 25ms after the previous and pops from scale 0.55 to 1 over `--fast` (`steps(2)`). Driven by per-ring timers (`dealt` class) so the settled scale(1) is a plain base style, never an animation fill — WebKit does not hold backwards fill during `animation-delay`, which left tiles stuck at the wrong size on iOS Safari. The frame swap is skipped under reduced motion.
- Reveal: the hidden cover crumbles away in three steps (scale 1, 0.66, 0.33, 0) over 140ms (`steps(1)`); the number arrives at scale 1.8 and snaps to 1 over `--fast` (`steps(2)`).
- Flood fill: cells revealed by one move are grouped by Chebyshev distance from the clicked cell; ring k crumbles after k times `--ring`, so the wave reads as motion travelling outward.
- Flag: the flag sprite stabs in from 8px above with a 1px settle over 120ms (`steps(1)`) and kicks up a two-pixel dust puff at its base over 160ms (`steps(2)`). A 400ms pointer hold shows a 3px cyan bar filling along the tile's bottom edge over the hold (`steps(8)`), so the gesture is discoverable on touch; the bar is progress feedback and stays under reduced motion.
- Loss: mines reveal in a chain ordered by distance from the clicked mine, 60ms apart; each mine pops from scale 1.6 to 1 (`--fast`, `steps(2)`). The clicked mine's cell flashes `--white` then `--pink` over 240ms (`steps(1)`) while the boom sprite in `--yellow` scales 0.4 → 1.4 → 2.2 over 300ms (`steps(1)`) and fades out. The board shakes horizontally with a settle — 0, 8, −8, 6, −4, 2, 0 px over 360ms (`steps(1)`). The scanline overlay rolls once (background-position 0 to 4px over 300ms). Face goes dead at the first explosion.
- Win: face goes cool, a "STAGE CLEAR" banner (cyan text on `--bg`, magenta border, Press Start 2P 16px) slams in from above with a 2px overshoot over 280ms (`steps(1)`) and stays. Around 40 confetti pixels (4px squares in the number colours) fall from the banner over 1.4s (`steps(14)`), tumbling in 90° steps, every third pixel delayed up to 160ms, then are removed. Every tile hops 4px up and back over 200ms (`steps(1)`), rings staggered 40ms apart from the last move. The LED timer rolls its digits (each digit counts up from 0 to its value over 360ms, `steps(10)`).
- Face: normal to worried is an instant sprite swap on pointerdown; back on pointerup or cancel.
- INSERT COIN: 1s step blink.
- Reduced motion (`prefers-reduced-motion: reduce`): no shake, no scanline roll, no confetti, no digit roll, no banner slide (it appears in place), no crumble/stab/puff/flash/boom scale, no deal-in, no frame swap and no hop — state changes are instant, ring delay 0. Sprite swaps (face, mine) and the blink remain.
- `?lab` opens the motion lab (`src/lab/`) in dev only (`npm run dev`): every moment above side by side, running the real components against proposed effects (including a chord-press "armed neighbours" preview), with per-card play buttons and a reduced-motion toggle. The lab is gated behind `import.meta.env.DEV` (dynamic import in `main.ts`, footer link in `AboutFooter.svelte`), so production builds drop the whole chunk and never ship it.

## Non-goals

Custom board sizes in the UI, multiplayer, a leaderboard beyond localStorage, themes other than Arcade, PWA or offline support, analytics.
