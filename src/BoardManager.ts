import Board from './Board';
import { coordinatesInBoard, getDirections } from './BoardHelper';
import BoardInput from './BoardInput';
import printBoard from './BoardPrinter';
import BoardState from './BoardState';
import { readlineSync, writeToStandardOutput } from './StandardIOHelper';

export function createBoard(size: number, bombNumber: number) {
  return new Board(size, bombNumber);
}

/**
 * This function will play the coordinates given in arguments and will create a new board
 * with it's new content, visited matrix and state accordingly.
 * @param board board on which you want to play
 * @param row row you want to play
 * @param col column you want to play
 * @returns { Board } returns new board
 */
function playCoordinates(board: Board, row: number, col: number): Board {
  if (!coordinatesInBoard(row, col, board.content) || board.visited[row][col]) {
    return board;
  }

  const newBoard = board;

  if (newBoard.content[row][col] === -1) {
    newBoard.state = BoardState.LOST;
    return newBoard;
  }

  const expandedBoard = expand(board, row, col);
  if (expandedBoard.remainingNotVisited === 0) {
    expandedBoard.state = BoardState.WON;
  }

  return expandedBoard;
}

function flagCoordinates(board: Board, row: number, col: number): Board {
  if (!coordinatesInBoard(row, col, board.content) || board.visited[row][col]) {
    return board;
  }

  const newBoard = board;
  newBoard.flagged[row][col] = !newBoard.flagged[row][col];
  return newBoard;
}

/**
 * This function will expand from starting cell to neighbour cells until it reaches
 * bomb adjacent cells
 * @param board the board on which you want to expand
 * @param row the starting row
 * @param col the starting col
 */
function expand(board: Board, row: number, col: number): Board {
  const expandedBoard = board;
  const directions = getDirections();
  const { content, visited, flagged } = expandedBoard;
  const queue = [[row, col]];
  let visitedCells = 0;

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    if (coordinatesInBoard(x, y, expandedBoard.content) && !visited[x][y] && !flagged[x][y]) {
      visited[x][y] = true;
      visitedCells += 1;
      if (content[x][y] === 0) {
        directions.forEach((dir) => {
          queue.push([x + dir[0], y + dir[1]]);
        });
      }
    }
  }

  expandedBoard.remainingNotVisited -= visitedCells;
  return expandedBoard;
}

export async function play(board: Board): Promise<BoardState> {
  while (board.state === BoardState.PLAYING) {
    printBoard(board);
    // we can disable no-await-in-loop because all calls are dependant on each other
    // eslint-disable-next-line no-await-in-loop
    const inputMode = await printAndBoardInputMode('Input R to reveal or F to flag/unflag cell');
    // we can disable no-await-in-loop because all calls are dependant on each other
    // eslint-disable-next-line no-await-in-loop
    const coord = await askCoordinates();
    const [row, col] = [coord[0], coord[1]];
    if (inputMode === BoardInput.REVEAL) {
      playCoordinates(board, row, col);
    } else {
      flagCoordinates(board, row, col);
    }
    writeToStandardOutput('\n');
  }
  printBoard(board);
  return board.state;
}

async function printAndGetNumberInput(message: string): Promise<number> {
  const userInput = await printAndGetInput(message, isNumber, 'Not an number, try again.');
  return Number.parseInt(userInput, 10);
}

async function printAndBoardInputMode(message: string): Promise<BoardInput> {
  const errMessage = 'Wrong input. Valid inputs are F for flag mode or R as reveal mode.';
  const validInput = (str: string) => str && (str.toUpperCase() === 'F' || str.toUpperCase() === 'R');
  const userInput = await printAndGetInput(message, validInput, errMessage);
  if (userInput.toUpperCase() === 'F') {
    return BoardInput.FLAG;
  }
  return BoardInput.REVEAL;
}

async function printAndGetInput(message: string, predicate: Function, errMessage: string): Promise<string> {
  writeToStandardOutput(message);
  const userInput = (await readlineSync());
  if (predicate(userInput)) {
    return userInput;
  }

  writeToStandardOutput(errMessage);
  return printAndGetInput(message, predicate, errMessage);
}

async function askCoordinates(): Promise<number[]> {
  const row = await printAndGetNumberInput('Row: ');
  const col = await printAndGetNumberInput('Col: ');
  return [row - 1, col - 1];
}

function isNumber(str: string): boolean {
  return !Number.isNaN(Number(str));
}
