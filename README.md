# Minesweeper

A pixel-art arcade Minesweeper with neon tiles, keyboard play and local best times.

[Play at minesweeper.hashcode.dev](https://minesweeper.hashcode.dev)

## How to play

Reveal every safe tile. Numbers count adjacent mines.

- Click or tap to reveal; click a revealed number to clear its neighbours when its adjacent flag count matches.
- Right-click or hold for 400ms to flag. On touch, use the REVEAL / FLAG mode buttons.
- Use arrow keys to move through the board, Enter or Space to reveal or chord, and F to flag.
- Pick EASY, MEDIUM or HARD to start a board. The face and INSERT COIN buttons restart.
- CRT scanlines default to on; sound defaults to off. Both toggles and your best time per level are saved in this browser.

## Development

Requires Node 24.

    nvm use
    npm ci
    npm run dev
    npm run check
    npm test
    npm run build
    npm run preview

Svelte 5 runes, TypeScript, Vite and Vitest. Game logic lives in src/minesweeper;
the visual and behaviour contract is in docs/design.md.

## Deployment

Vercel builds master with the Vite preset declared in vercel.json.
The production build is written to dist.
