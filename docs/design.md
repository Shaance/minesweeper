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
6. After a game ends, a blinking magenta line "▶ INSERT COIN TO PLAY AGAIN" (1s step blink, no fade). It is a button; activating it starts a new game at the same level. The face button does the same at any time.
7. Footer: "Code on GitHub" link in `--hi`, 9px.

The whole page carries the scanline overlay when CRT is on: a fixed, pointer-events-none `repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 2px, transparent 2px 4px)`. CRT defaults to on, remembered in localStorage.

At 375px wide the 12 by 12 board must fit with cells of at least 28px, and every control stays reachable without horizontal scroll. The mode toggle is the primary flag affordance on touch, long-press is the second.

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

- Pointer: primary click reveals (or flags when the mode toggle is on FLAG). Right-click or a 400ms press flags. Clicking a revealed number chords. `contextmenu` is suppressed on the board. A long-press that flagged must not also reveal on release.
- Keyboard: the board is a grid with roving tabindex. Arrow keys move focus (wrapping is not required), Enter or Space reveals (chords on a number), F flags. Focus ring: 2px `--cyan` outline, offset -2px, visible only for `:focus-visible`.
- Face button: normal face while idle or playing, worried while any tile is pressed, dead after loss, cool after win. Clicking it starts a new game.
- Timer starts on the first reveal, stops on win or loss, resets on new game or level change. Level change starts a new board immediately.
- Hi-score: best time per level in localStorage key `minesweeper.best.<LEVEL>`. Updated on win; the HI-SCORE value flashes cyan once when beaten.
- Sound: WebAudio square-wave blips, muted by default, toggle remembered in localStorage. Reveal 880Hz 40ms, flag 440Hz 40ms, loss a descending 3-note run, win an ascending 4-note run. No audio files.
- Every control is a real `<button>`. Cells carry `aria-label` "row R column C, hidden | flagged | N | empty | mine". A visually hidden `aria-live="polite"` region announces "You won in N seconds", "You lost" and "New game".

## Motion

Timing tokens on `:root`: `--fast: 120ms`, `--ring: 25ms`, `--shake: 60ms`. Easing `steps()` or linear only; no smooth easing curves anywhere, the piece is 8-bit.

- Tile press: bevel inverts on pointerdown with no transition. On reveal the whole board translates 1px down for one `--shake` and back (`steps(1)`).
- Flood fill: cells revealed by one move are grouped by Chebyshev distance from the clicked cell; ring k appears after k times `--ring`. Each cell flashes `--cyan` at 60% for `--fast` on arrival, then settles to `--open`. Numbers arrive at scale 1.4 and snap to 1 after `--fast` (`steps(2)`).
- Loss: mines reveal in a chain ordered by distance from the clicked mine, 60ms apart. Each shows the boom sprite in `--yellow` for `--fast` then the mine sprite. The board shakes 6px horizontally for 300ms (`steps(6)`). The scanline overlay rolls once (background-position 0 to 4px over 300ms). Face goes dead at the first explosion.
- Win: face goes cool, a "STAGE CLEAR" banner (cyan text on `--bg`, magenta border, Press Start 2P 16px) slides in from the top over the board with `steps(6)` over 240ms and stays. Around 40 confetti pixels (4px squares in the number colours) fall from the banner over 1.2s, `steps(12)`, then are removed. The LED timer rolls its digits (each digit counts up from 0 to its value over 360ms, `steps(10)`).
- Face: normal to worried is an instant sprite swap on pointerdown; back on pointerup or cancel.
- INSERT COIN: 1s step blink.
- Reduced motion (`prefers-reduced-motion: reduce`): no shake, no scanline roll, no confetti, no digit roll, no banner slide (it appears in place), ring delay 0 and the arrival flash becomes an instant colour swap with no animation. Sprite swaps and the blink remain.

## Non-goals

Custom board sizes in the UI, multiplayer, a leaderboard beyond localStorage, themes other than Arcade, PWA or offline support, analytics.
