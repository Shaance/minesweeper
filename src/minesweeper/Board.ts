import { coordinatesInBoard, createMatrix, getDirectionsWithDiagonals } from './BoardHelper';
import BoardState from './BoardState';
import CellType from './CellType';

const DEFAULT_SIZE = 8;
const DEFAULT_BOMB_NUMBERS = 8;
export default class Board {
  size: number;

  bombsNumber: number;

  content: number[][];

  visited: boolean[][];

  flagged: boolean[][];

  state: BoardState;

  remainingNotVisited: number;

  constructor(size?: number, bombsNumber?: number) {
    const actualSize = size && size > 0
      ? size
      : DEFAULT_SIZE;
    const actualBombsNumber = bombsNumber && bombsNumber > 0
      ? bombsNumber
      : DEFAULT_BOMB_NUMBERS;
    this.content = getBoardContent(actualSize, actualBombsNumber);
    this.visited = getBooleanMatrix(actualSize);
    this.flagged = getBooleanMatrix(actualSize);
    this.size = actualSize;
    this.bombsNumber = actualBombsNumber;
    this.state = BoardState.INITIAL;
    this.remainingNotVisited = actualSize * actualSize - actualBombsNumber;
  }

  withFlagged(flagged: boolean[][]) {
    this.flagged = flagged;
    return this;
  }
}

function getBoardContent(size: number, bombsNumber: number) {
  const bombPositions = getBombPositions(size, bombsNumber);
  const board = placeBombs(getZeroesMatrix(size), bombPositions);
  return markAdjacentCells(board, bombPositions);
}

function getBombPositions(size: number, bombsNumber: number): Set<number[]> {
  const bombPositions = new Set<string>();
  while (bombPositions.size !== bombsNumber) {
    const randomPositions = generatePosition(size);
    bombPositions.add(String(randomPositions[0]) + String(randomPositions[1]));
  }

  const positionsArray = Array.from(bombPositions)
    .map((str: string) => [Number(str.charAt(0)), Number(str.charAt(1))]);

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

function getZeroesMatrix(size: number) {
  return createMatrix(size, (matrix: number[][], idx: number) => matrix[idx].push(0));
}

function getBooleanMatrix(size: number) {
  return createMatrix(size, (matrix: boolean[][], idx: number) => matrix[idx].push(false));
}
