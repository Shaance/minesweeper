import { describe, it, expect } from 'vitest';
import type Board from '../minesweeper/Board';
import BoardInput from '../minesweeper/BoardInput';
import { createBoard, getBoardAfterPlayerMove } from '../minesweeper/BoardManager';
import BoardState from '../minesweeper/BoardState';
import CellType from '../minesweeper/CellType';
import Level from '../minesweeper/Level';

describe('getBoardAfterPlayerMove function', () => {
  it('should return same board when coordinates are incorrect', () => {
    const board = createBoard();
    const newBoard = getBoardAfterPlayerMove(BoardInput.REVEAL, board, -1, -3);
    expect(newBoard).toEqual(board);
  });

  it('should return same board when cell already visited', () => {
    let board = createBoard();
    // make sure we get the playable board
    board = getBoardAfterPlayerMove(BoardInput.REVEAL, board, 1, 1);
    const [x, y] = [1, 3];
    board.visited[x][y] = true;
    const newBoard = getBoardAfterPlayerMove(BoardInput.REVEAL, board, x, y);
    expect(newBoard).toEqual(board);
  });

  it('should have lost state if bomb coordinates are played', () => {
    let board = createBoard();
    // make sure we get the playable board
    board = getBoardAfterPlayerMove(BoardInput.REVEAL, board, 1, 1);
    const coord = getFirstBombFromBoard(board);

    if (coord) {
      const [x, y] = [coord[0], coord[1]];
      const newBoard = getBoardAfterPlayerMove(BoardInput.REVEAL, board, x, y);
      expect(newBoard.state).toEqual(BoardState.LOST);
    }
  });

  it('should have win state if all non bomb coordinates are played', () => {
    let board = createBoard();
    // make sure we get the playable board
    board = getBoardAfterPlayerMove(BoardInput.REVEAL, board, 1, 1);
    const notBomb = (value: number) => value !== CellType.BOMB;
    const coordinates = getCoordinates(board, notBomb);
    coordinates.forEach((coord) => {
      const [x, y] = [coord[0], coord[1]];
      board = getBoardAfterPlayerMove(BoardInput.REVEAL, board, x, y);
    });

    expect(board.state).toEqual(BoardState.WON);
  });

  it('should update visited matrix when playing coordinates', () => {
    const board = createBoard();
    const [x, y] = [1, 3];
    const newBoard = getBoardAfterPlayerMove(BoardInput.REVEAL, board, x, y);
    expect(newBoard.visited[x][y]).toEqual(true);
  });

  it('should update flagged matrix when flagging coordinates', () => {
    const board = createBoard();
    const [x, y] = [1, 3];
    const newBoard = getBoardAfterPlayerMove(BoardInput.FLAG, board, x, y);
    expect(newBoard.flagged[x][y]).toEqual(true);
  });

  it('should decrease availableFlags when flagging coordinates', () => {
    const board = createBoard();
    const [x, y] = [1, 3];
    const expected = board.availableFlags - 1;
    const newBoard = getBoardAfterPlayerMove(BoardInput.FLAG, board, x, y);
    expect(newBoard.availableFlags).toEqual(expected);
  });

  it('should increase availableFlags when unflagging coordinates', () => {
    const board = createBoard();
    const [x, y] = [1, 3];
    const expected = board.availableFlags;
    const newBoard = getBoardAfterPlayerMove(BoardInput.FLAG, board, x, y);
    const finalBoard = getBoardAfterPlayerMove(BoardInput.FLAG, newBoard, x, y);
    expect(finalBoard.availableFlags).toEqual(expected);
  });

  it('should not decrease availableFlags when it is equal to 0', () => {
    const board = createBoard(Level.CUSTOM, 5, 1);
    const [x, y] = [1, 3];
    const expected = 0;
    const newBoard = getBoardAfterPlayerMove(BoardInput.FLAG, board, x, y);
    const finalBoard = getBoardAfterPlayerMove(BoardInput.FLAG, newBoard, x + 1, y + 1);
    expect(finalBoard.availableFlags).toEqual(expected);
  });

  it('should not be able to visit a flagged coordinates', () => {
    const board = createBoard();
    const [x, y] = [1, 3];
    const flaggedBoard = getBoardAfterPlayerMove(BoardInput.FLAG, board, x, y);
    const finalBoard = getBoardAfterPlayerMove(BoardInput.REVEAL, flaggedBoard, x, y);
    expect(finalBoard.visited[x][y]).toEqual(false);
  });

  it('should always expand on first play', () => {
    const bombsNumber = 8;
    const size = 8;
    const board = createBoard(Level.CUSTOM, size, bombsNumber);
    const [x, y] = [1, 3];
    const newBoard = getBoardAfterPlayerMove(BoardInput.REVEAL, board, x, y);
    expect(newBoard.remainingNotVisited).toBeLessThan(size * size - bombsNumber - 1);
  });

  it('should return same board when board state is WON', () => {
    const board = createBoard(Level.CUSTOM, 5, 4).withState(BoardState.WON);
    const [x, y] = [1, 3];
    const newBoard = getBoardAfterPlayerMove(BoardInput.REVEAL, board, x, y);
    const flaggedBoard = getBoardAfterPlayerMove(BoardInput.FLAG, newBoard, x, y);

    expect(newBoard).toEqual(board);
    expect(newBoard).toEqual(flaggedBoard);
    expect(board).toEqual(flaggedBoard);
  });

  it('should return same board when board state is LOST', () => {
    const board = createBoard(Level.CUSTOM, 5, 4).withState(BoardState.LOST);
    const [x, y] = [1, 3];
    const newBoard = getBoardAfterPlayerMove(BoardInput.REVEAL, board, x, y);
    const flaggedBoard = getBoardAfterPlayerMove(BoardInput.FLAG, newBoard, x, y);

    expect(newBoard).toEqual(board);
    expect(newBoard).toEqual(flaggedBoard);
    expect(board).toEqual(flaggedBoard);
  });

  it('should reveal all bombs when state is LOST', () => {
    let board = createBoard();
    // make sure we get the playable board
    board = getBoardAfterPlayerMove(BoardInput.REVEAL, board, 1, 1);
    const coord = getFirstBombFromBoard(board);

    if (coord) {
      const [x, y] = [coord[0], coord[1]];
      const newBoard = getBoardAfterPlayerMove(BoardInput.REVEAL, board, x, y);
      const { visited } = newBoard;
      newBoard.content.forEach((row, i) => {
        row.forEach((elem, j) => {
          if (elem === CellType.BOMB) {
            expect(visited[i][j]).toEqual(true);
          }
        });
      });
    }
  });
});

function getFirstBombFromBoard(board: Board): number[] | undefined {
  const coord = getCoordinates(board, (value: number) => value === CellType.BOMB);
  if (coord.length > 0) {
    return coord[0];
  }
  return undefined;
}

function getCoordinates(board: Board, predicate: Function): number[][] {
  const coordinates: number[][] = [];
  board.content.forEach((row, i) => {
    row.forEach((value, j) => {
      if (predicate(value)) {
        coordinates.push([i, j]);
      }
    });
  });
  return coordinates;
}

describe('chording', () => {
  function chordBoard() {
    const board = createBoard(Level.CUSTOM, 3, 1).withState(BoardState.PLAYING);
    board.content = [[-1, 1, 0], [1, 1, 0], [0, 0, 0]];
    board.visited[1][1] = true;
    board.remainingNotVisited = 7;
    return board;
  }

  it('reveals hidden unflagged neighbours when the adjacent flags match', () => {
    const board = chordBoard();
    getBoardAfterPlayerMove(BoardInput.FLAG, board, 0, 0);
    const result = getBoardAfterPlayerMove(BoardInput.CHORD, board, 1, 1);
    expect(result).toBe(board);
    expect(board.visited).toEqual([[false, true, true], [true, true, true], [true, true, true]]);
    expect(board.remainingNotVisited).toBe(0);
    expect(board.state).toBe(BoardState.WON);
  });

  it('does nothing when flags differ or the target is not a revealed number', () => {
    const board = chordBoard();
    const before = board.visited.map((row) => [...row]);
    for (const [r, c] of [[1, 1], [0, 1], [2, 2], [-1, 0]]) {
      expect(getBoardAfterPlayerMove(BoardInput.CHORD, board, r, c)).toBe(board);
      expect(board.visited).toEqual(before);
      expect(board.remainingNotVisited).toBe(7);
      expect(board.availableFlags).toBe(1);
    }
  });

  it('loses when a matching flag is on the wrong cell', () => {
    const board = chordBoard();
    getBoardAfterPlayerMove(BoardInput.FLAG, board, 0, 1);
    getBoardAfterPlayerMove(BoardInput.CHORD, board, 1, 1);
    expect(board.state).toBe(BoardState.LOST);
    expect(board.visited[0][0]).toBe(true);
    expect(board.visited[0][1]).toBe(false);
    expect(board.flagged[0][1]).toBe(true);
  });
});
