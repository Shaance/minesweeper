import { describe, it, expect } from 'vitest';
import { isSolvableWithoutGuessing } from '../minesweeper/Solver';

describe('isSolvableWithoutGuessing', () => {
  it('solves by flood fill alone when the first click cascades everywhere', () => {
    // One bomb in the corner; a zero start reaches every non-bomb cell.
    const content = [
      [-1, 1, 0],
      [1, 1, 0],
      [0, 0, 0],
    ];
    expect(isSolvableWithoutGuessing(content, 2, 2)).toBe(true);
  });

  it('marks all unknown neighbours as mines when the count matches', () => {
    // Two bombs along the top edge; the revealed 2 at (1,0) proves both.
    const content = [
      [-1, -1, 1],
      [2, 2, 1],
      [0, 0, 0],
    ];
    expect(isSolvableWithoutGuessing(content, 2, 1)).toBe(true);
  });

  it('applies the subset rule between frontier constraints', () => {
    // Needs the subset deduction: (0,2) is proven a mine from constraints
    // (1,0) and (1,1), which then frees (0,1) and finally (0,0).
    const content = [
      [-1, 2, -1],
      [1, 2, 1],
      [0, 0, 0],
    ];
    expect(isSolvableWithoutGuessing(content, 2, 1)).toBe(true);
  });

  it('returns false when the board ends in a 50/50 guess', () => {
    // The revealed 1 at (0,0) leaves three candidates for one mine.
    const content = [
      [1, -1],
      [1, 1],
    ];
    expect(isSolvableWithoutGuessing(content, 0, 0)).toBe(false);
  });

  it('returns false when the start is outside the board', () => {
    expect(isSolvableWithoutGuessing([[0]], 5, 5)).toBe(false);
  });
});
