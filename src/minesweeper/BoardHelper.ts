import BoardState from './BoardState';
import type { BiConsumer } from './CommonHelper';
import type { GameSettings } from './GameSettings';
import Level from './Level';

export const DEFAULT_SIZE = 8;
export const DEFAULT_BOMBS_NUMBER = 10;

function createMatrix(size: number, func: BiConsumer<any[], number>) {
  let i = 0;
  let j = 0;

  const blankBoard = [];

  while (i !== size) {
    blankBoard.push([]);
    while (j !== size) {
      func(blankBoard, i);
      j += 1;
    }
    j = 0;
    i += 1;
  }

  return blankBoard;
}

export function coordinatesInBoard(x: number, y: number, boardContent: number[][]): boolean {
  return x >= 0 && y >= 0 && x < boardContent.length && y < boardContent[x].length;
}

export function getDirectionsWithDiagonals(): number[][] {
  return [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]];
}

export function getDirections(): number[][] {
  return [[0, 1], [1, 0], [0, -1], [-1, 0]];
}

export function getNumberMatrix(size: number, number: number) {
  return createMatrix(size, (matrix: number[][], idx: number) => matrix[idx].push(number));
}

export function getBooleanMatrix(size: number, bool = false) {
  return createMatrix(size, (matrix: boolean[][], idx: number) => matrix[idx].push(bool));
}

export function isPlayingState(state: BoardState) {
  return state === BoardState.INITIAL || state === BoardState.PLAYING;
}

export function getGameSettings(level?: Level, size?: number, bombsNumber?: number): GameSettings {
  if (!level || level === Level.EASY) {
    return {
      size: DEFAULT_SIZE,
      bombsNumber: DEFAULT_BOMBS_NUMBER,
    };
  }

  if (level === Level.CUSTOM) {
    const actualSize = size > 0 ? size : DEFAULT_SIZE;
    return {
      size: actualSize,
      bombsNumber: bombsNumber > 0 && bombsNumber < actualSize
        ? bombsNumber
        : DEFAULT_BOMBS_NUMBER,
    };
  }

  if (level === Level.MEDIUM) {
    return {
      size: 10,
      bombsNumber: 16,
    };
  }

  return {
    size: 12,
    bombsNumber: 25,
  };
}
