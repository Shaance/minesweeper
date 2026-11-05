# AGENTS.md

## Throwaway demo / comparison pages

- Never add demo, mock, or comparison pages to this repo — not under `src/`,
  not as `docs/mocks/`, not as query-param routes (`?lab`, `?mocks`). Build them
  outside the repo (e.g. `/tmp/page.html`) and open them in a browser pane to
  show the user. They are never part of a commit.
- No dev-only routes or pages at all: `src/` must stay free of
  `import.meta.env.DEV`. Enforced by `npm run check` via
  `scripts/no-dev-pages.mjs` on every PR.
- When a design was explored with a throwaway page, the shipped behavior plus
  `docs/design.md` are the only record — the page itself is deleted, not merged.
