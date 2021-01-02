import { coordinatesInBoard, createMatrix } from './BoardHelper';
import BoardState from './BoardState';

export default class Board {
  size: number;

  content: number[][];

  visited: boolean[][];

  state: BoardState;

  remainingNotVisited: number;

  constructor(size: number, bombsNumber: number) {
    this.content = getBoardContent(size, bombsNumber);
    this.visited = getVisitedBoard(size);
    this.size = size;
    this.state = BoardState.PLAYING;
    this.remainingNotVisited = size * size - bombsNumber;
  }
}

/**
 * -1 means bomb, -2 means visited
 */
function getBoardContent(size: number, bombsNumber: number) {
  const bombPositions = getBombPositions(size, bombsNumber);
  const board = placeBombs(getBlankBoard(size), bombPositions);
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
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]];

  bombPositions.forEach((coord) => {
    const [x, y] = [coord[0], coord[1]];
    directions.forEach((dir) => {
      const xi = x + dir[0];
      const yi = y + dir[1];
      if (coordinatesInBoard(xi, yi, markedBoard) && markedBoard[xi][yi] !== -1) {
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
    newBoard[x][y] = -1;
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

function getBlankBoard(size: number) {
  return createMatrix(size, (matrix: number[][], idx: number) => matrix[idx].push(0));
}

function getVisitedBoard(size: number) {
  return createMatrix(size, (matrix: boolean[][], idx: number) => matrix[idx].push(false));
}
