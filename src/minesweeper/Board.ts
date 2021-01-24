import {
  coordinatesInBoard, DEFAULT_BOMBS_NUMBER, DEFAULT_SIZE, getBooleanMatrix, getDirectionsWithDiagonals, getNumberMatrix,
} from './BoardHelper';
import BoardState from './BoardState';
import CellType from './CellType';
import type Level from './Level';

export default class Board {
  size: number;

  bombsNumber: number;

  content: number[][];

  visited: boolean[][];

  flagged: boolean[][];

  state: BoardState;

  level: Level;

  remainingNotVisited: number;

  constructor(size: number, bombsNumber: number, level: Level) {
    const actualSize = size > 0
      ? size
      : DEFAULT_SIZE;
    const actualBombsNumber = bombsNumber > 0
      ? bombsNumber
      : DEFAULT_BOMBS_NUMBER;
    this.content = getBoardContent(actualSize, actualBombsNumber);
    this.visited = getBooleanMatrix(actualSize);
    this.flagged = getBooleanMatrix(actualSize);
    this.size = actualSize;
    this.level = level;
    this.bombsNumber = actualBombsNumber;
    this.state = BoardState.INITIAL;
    this.remainingNotVisited = size * size - bombsNumber;
  }

  withFlagged(flagged: boolean[][]) {
    this.flagged = flagged;
    return this;
  }

  withState(state: BoardState) {
    this.state = state;
    return this;
  }
}

function getBoardContent(size: number, bombsNumber: number) {
  const bombPositions = getBombPositions(size, bombsNumber);
  const board = placeBombs(getNumberMatrix(size, 0), bombPositions);
  return markAdjacentCells(board, bombPositions);
}

function getBombPositions(size: number, bombsNumber: number): Set<number[]> {
  const bombPositions = new Set<string>();
  while (bombPositions.size !== bombsNumber) {
    const randomPositions = generatePosition(size);
    bombPositions.add(`${String(randomPositions[0])}-${String(randomPositions[1])}`);
  }

  const positionsArray = Array.from(bombPositions)
    .map((str: string) => {
      const split = str.split('-');
      return [Number(split[0]), Number(split[1])];
    });

  return new Set(positionsArray);
}

function markAdjacentCells(board: number[][], bombPositions: Set<number[]>) {
  const markedBoard = board;
  const directions = getDirectionsWithDiagonals();

  bombPositions.forEach((coord) => {
    const [x, y] = [coord[0], coord[1]];
    directions.forEach((dir) => {
      const xi = x + dir[0];
      const yi = y + dir[1];
      if (coordinatesInBoard(xi, yi, markedBoard) && markedBoard[xi][yi] !== CellType.BOMB) {
        markedBoard[xi][yi] += 1;
      }
    });
  });
  return markedBoard;
}

function placeBombs(board: number[][], bombPositions: Set<number[]>) {
  const newBoard = board;
  bombPositions.forEach((coord: number[]) => {
    const [x, y] = [coord[0], coord[1]];
    newBoard[x][y] = CellType.BOMB;
  });

  return newBoard;
}

function generatePosition(size: number) {
  return [getRandomInt(0, size), getRandomInt(0, size)];
}

// The maximum is exclusive and the minimum is inclusive
function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}
