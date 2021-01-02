import Board from './Board';
import { coordinatesInBoard } from './BoardHelper';
import BoardState from './BoardState';
import { printBoard, readlineSync, writeToStandardOutput } from './StandardIOHelper';

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
  const newBoard = board;
  // const visitedMatrix = board.visited;
  // const { content } = board;
  // let { remainingNotVisited, state } = board;

  if (!coordinatesInBoard(row, col, newBoard.content) || newBoard.visited[row][col]) {
    return newBoard;
  }

  if (newBoard.content[row][col] === -1) {
    newBoard.state = BoardState.LOST;
    return newBoard;
  }

  newBoard.visited[row][col] = true;
  newBoard.remainingNotVisited -= 1;
  // const revealedNumber = expand(board);
  // remainingNotVisited -= revealedNumber;
  if (newBoard.remainingNotVisited === 0) {
    newBoard.state = BoardState.WON;
  }

  return newBoard;
}

// function expand(board: Board): number {
//   // TODO
//   return 0;
// }

export async function play(board: Board): Promise<BoardState> {
  while (board.state === BoardState.PLAYING) {
    printBoard(board);

    // we can disable no-await-in-loop because all calls are dependant on each other
    // eslint-disable-next-line no-await-in-loop
    const coord = await askCoordinates();
    playCoordinates(board, coord[0], coord[1]);
    writeToStandardOutput('\n');
  }
  return board.state;
}

// TODO: have to check if number
async function printAndGetInput(message: string): Promise<number> {
  writeToStandardOutput(message);
  const userInput = await readlineSync();
  return Number.parseInt(userInput, 10);
}

async function askCoordinates(): Promise<number[]> {
  const row = await printAndGetInput('Row: ');
  const col = await printAndGetInput('Col: ');
  return [row - 1, col - 1];
}
