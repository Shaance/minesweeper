export type Scenario = 'reveal' | 'cascade' | 'flag' | 'boom' | 'win' | 'deal' | 'chord';

export interface Layout {
  n: number;
  values: number[][];
}

function grid(n: number, fill: (r: number, c: number) => number): number[][] {
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => fill(r, c)));
}

export function layout(scenario: Scenario): Layout {
  switch (scenario) {
    case 'reveal':
      return { n: 3, values: grid(3, (r, c) => (r === 1 && c === 1 ? 3 : 1)) };
    case 'cascade':
      return { n: 7, values: grid(7, (r, c) => (r === 3 && c === 3 ? 0 : 1)) };
    case 'flag':
      return { n: 3, values: grid(3, () => 1) };
    case 'boom':
      return {
        n: 5,
        values: grid(5, (r, c) =>
          [[0, 0], [0, 4], [4, 0], [4, 4], [2, 2]].some(([mr, mc]) => mr === r && mc === c)
            ? -1
            : ((r + c) % 3) + 1),
      };
    case 'win':
      return { n: 5, values: grid(5, (r, c) => ((r * 5 + c) % 4) + 1) };
    case 'deal':
      return { n: 9, values: grid(9, (r, c) => ((r + c) % 5 === 0 ? 0 : ((r * 3 + c) % 3) + 1)) };
    case 'chord':
      return { n: 5, values: grid(5, (r, c) => (r === 2 && c === 2 ? 2 : 1)) };
  }
}

export interface InitialState {
  visited: boolean[][];
  flagged: boolean[][];
}

// Mid-game starting position per scenario (all hidden unless noted).
export function initialState(scenario: Scenario): InitialState {
  const { n } = layout(scenario);
  const visited = Array.from({ length: n }, () => Array<boolean>(n).fill(false));
  const flagged = Array.from({ length: n }, () => Array<boolean>(n).fill(false));
  if (scenario === 'chord') {
    for (let c = 0; c < n; c++) visited[0][c] = true;
    visited[2][2] = true;
    flagged[1][1] = true;
    flagged[3][3] = true;
  }
  return { visited, flagged };
}

// Hidden, unflagged Chebyshev neighbours of a cell — the chord targets.
export function chordTargets(n: number, r0: number, c0: number, flagged: boolean[][]): number[] {
  const targets: number[] = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    if (!dr && !dc) continue;
    const r = r0 + dr, c = c0 + dc;
    if (r < 0 || c < 0 || r >= n || c >= n || flagged[r][c]) continue;
    targets.push(r * n + c);
  }
  return targets;
}

export function cheb(r: number, c: number, r0: number, c0: number): number {
  return Math.max(Math.abs(r - r0), Math.abs(c - c0));
}

export function ring(r: number, c: number, n: number): number {
  return cheb(r, c, n >> 1, n >> 1);
}
