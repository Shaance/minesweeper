import Board from './Board';
import { coordinatesInBoard, getDirections } from './BoardHelper';
import BoardInput from './BoardInput';
import printBoard from './BoardPrinter';
import BoardState from './BoardState';
import CellType from './CellType';
import { isNumber, Predicate } from './CommonHelper';
import { readlineSync, writeToStandardOutput } from './StandardIOHelper';

export function createBoard(size: number, bombNumber: number): Board {
  return new Board(size, bombNumber);
}

export async function play(board: Board): Promise<BoardState> {
  let playableBoard = board;
  while (playableBoard.state === BoardState.PLAYING || playableBoard.state === BoardState.INITIAL) {
    printBoard(playableBoard);
    // we can disable no-await-in-loop because all calls are dependant on each other
    // eslint-disable-next-line no-await-in-loop
    const inputMode = await printAndGetInputMode('Input R to reveal or F to flag/unflag cell');
    // eslint-disable-next-line no-await-in-loop
    const coord = await askCoordinates();
    const [row, col] = [coord[0], coord[1]];
    playableBoard = getBoardAfterPlayerMove(inputMode, playableBoard, row, col);
    writeToStandardOutput('\n');
  }
  printBoard(playableBoard);
  return playableBoard.state;
}

export function getBoardAfterPlayerMove(inputMode: BoardInput, board: Board, row: number, col: number): Board {
  if (inputMode === BoardInput.REVEAL) {
    return playCoordinates(getPlayableBoard(board, row, col), row, col);
  }
  return flagCoordinates(board, row, col);
}

/**
 * We always want the first coordinates the player picks to be expandable. This function will
 * regenerate a board as long as the coordinates in input points to either a bomb or a cell
 * that is adjacent to bombs
 */
function getPlayableBoard(board: Board, row: number, col: number): Board {
  if (board.state !== BoardState.INITIAL || !coordinatesInBoard(row, col, board.content) || isEmptyCell(board, row, col)) {
    return board;
  }
  const newBoard = createBoard(board.size, board.bombsNumber).withFlagged(board.flagged);
  return getPlayableBoard(newBoard, row, col);
}

function isEmptyCell(board: Board, row: number, col: number): boolean {
  return coordinatesInBoard(row, col, board.content) && board.content[row][col] === CellType.EMPTY;
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
  if (!coordinatesInBoard(row, col, board.content) || board.visited[row][col] || finishedState(board)) {
    return board;
  }

  if (board.content[row][col] === CellType.BOMB) {
    const newBoard = board;
    newBoard.state = BoardState.LOST;
    newBoard.visited[row][col] = true;
    return newBoard;
  }

  const expandedBoard = expand(board, row, col);
  if (expandedBoard.remainingNotVisited === 0) {
    expandedBoard.state = BoardState.WON;
  }

  if (expandedBoard.state === BoardState.INITIAL) {
    expandedBoard.state = BoardState.PLAYING;
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

function finishedState(board: Board) {
  return board.state === BoardState.LOST || board.state === BoardState.WON;
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
  const { content, visited } = expandedBoard;
  const stack = [[row, col]];
  let visitedCells = 0;

  while (stack.length > 0) {
    const [x, y] = stack.pop();
    if (canExpand(expandedBoard, x, y)) {
      visited[x][y] = true;
      visitedCells += 1;
      if (content[x][y] === CellType.EMPTY) {
        directions.forEach((dir) => {
          stack.push([x + dir[0], y + dir[1]]);
        });
      }
    }
  }

  expandedBoard.remainingNotVisited -= visitedCells;
  return expandedBoard;
}

function canExpand(board: Board, x: number, y: number) {
  const { content, visited, flagged } = board;
  return coordinatesInBoard(x, y, content) && !visited[x][y] && !flagged[x][y];
}

async function printAndGetNumberInput(message: string): Promise<number> {
  const userInput = await printAndGetInput(message, isNumber, 'Not an number, try again.');
  return Number.parseInt(userInput, 10);
}

async function printAndGetInputMode(message: string): Promise<BoardInput> {
  const errMessage = 'Wrong input. Valid inputs are F for flag mode or R as reveal mode.';
  const validInput = (str: string) => str && (str.toUpperCase() === 'F' || str.toUpperCase() === 'R');
  const userInput = await printAndGetInput(message, validInput, errMessage);
  if (userInput.toUpperCase() === 'F') {
    return BoardInput.FLAG;
  }
  return BoardInput.REVEAL;
}

async function printAndGetInput(message: string, predicate: Predicate<string>, errMessage: string): Promise<string> {
  writeToStandardOutput(message);
  const userInput = await readlineSync();
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
