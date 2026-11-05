import CellType from './CellType';
import { getDirections, getDirectionsWithDiagonals } from './BoardHelper';

/**
 * Pure-logic solvability check, used at board generation time so that every
 * dealt board can be finished without a 50/50 guess. Starting from a first
 * reveal at (startRow, startCol), it repeatedly applies the certain
 * deductions (all unknown neighbours are mines / all are safe, plus the
 * subset rule between two frontier constraints) and reports whether every
 * non-bomb cell ends up revealed. The flood fill mirrors BoardManager.expand:
 * empty cells cascade in the 4 cardinal directions only.
 */
export function isSolvableWithoutGuessing(content: number[][], startRow: number, startCol: number): boolean {
  const n = content.length;
  const total = n * n;
  const inBoard = (r: number, c: number) => r >= 0 && c >= 0 && r < n && c < n;
  const bit = (r: number, c: number) => 1n << BigInt(r * n + c);
  const bitsOf = (mask: bigint): number[] => {
    const cells: number[] = [];
    for (let i = 0; i < total; i++) if (mask & (1n << BigInt(i))) cells.push(i);
    return cells;
  };
  const popcount = (mask: bigint) => bitsOf(mask).length;

  let revealed = 0n;
  let mines = 0n; // logically proven bombs

  const reveal = (r: number, c: number) => {
    const stack = [[r, c]];
    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      if (!inBoard(x, y) || revealed & bit(x, y) || mines & bit(x, y)) continue;
      revealed |= bit(x, y);
      if (content[x][y] === CellType.EMPTY) {
        for (const [dr, dc] of getDirections()) stack.push([x + dr, y + dc]);
      }
    }
  };

  if (!inBoard(startRow, startCol)) return false;
  reveal(startRow, startCol);

  // Each round with progress reveals or proves at least one cell, so the
  // loop is bounded by 2 * total rounds; the cap is a safety net only.
  for (let round = 0; round <= 2 * total; round++) {
    let progress = false;
    const constraints: { unknowns: bigint; need: number }[] = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      if (!(revealed & bit(r, c)) || content[r][c] <= 0) continue;
      const unknowns: number[] = [];
      let knownMines = 0;
      for (const [dr, dc] of getDirectionsWithDiagonals()) {
        const x = r + dr;
        const y = c + dc;
        if (!inBoard(x, y)) continue;
        if (mines & bit(x, y)) knownMines += 1;
        else if (!(revealed & bit(x, y))) unknowns.push(x * n + y);
      }
      if (unknowns.length === 0) continue;
      const mask = unknowns.reduce((m, i) => m | (1n << BigInt(i)), 0n);
      const need = content[r][c] - knownMines;
      constraints.push({ unknowns: mask, need });
      if (need === unknowns.length) {
        mines |= mask;
        progress = true;
      } else if (need === 0) {
        for (const i of unknowns) reveal(Math.floor(i / n), i % n);
        progress = true;
      }
    }
    if (!progress) {
      // Subset rule: when the unknowns of constraint A are a strict subset of
      // the unknowns of B, the extra cells of B are decided by need(B)-need(A).
      let applied = false;
      for (let a = 0; a < constraints.length && !applied; a++) {
        for (let b = 0; b < constraints.length && !applied; b++) {
          if (a === b) continue;
          const A = constraints[a];
          const B = constraints[b];
          if (A.unknowns === B.unknowns) continue;
          if ((A.unknowns & B.unknowns) !== A.unknowns) continue;
          const extra = B.unknowns & ~A.unknowns;
          const diff = B.need - A.need;
          if (diff === popcount(extra)) {
            mines |= extra;
            applied = true;
          } else if (diff === 0) {
            for (const i of bitsOf(extra)) reveal(Math.floor(i / n), i % n);
            applied = true;
          }
        }
      }
      progress = applied;
    }
    if (!progress) break;
  }

  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (content[r][c] !== CellType.BOMB && !(revealed & bit(r, c))) return false;
  }
  return true;
}
