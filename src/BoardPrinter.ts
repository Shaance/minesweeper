import Board from './Board';
import BoardState from './BoardState';
import { writeToStandardOutput } from './StandardIOHelper';

function getPrintableFirstRow(length: number): string {
  let counter = 0;
  let rowString = ' ';

  while (counter <= length) {
    if (counter === 0) {
      rowString += '  ';
    } else {
      rowString += ` ${counter} `;
    }
    counter += 1;
  }

  return `${rowString}\n`;
}

function getPrintableBoard(board: Board): string {
  const visitedMatrix = board.visited;
  const { content } = board;

  let finalString = getPrintableFirstRow(content[0].length);

  visitedMatrix.forEach((row: boolean[], i: number) => {
    finalString += ` ${i + 1} `;
    row.forEach((visited: boolean, j: number) => {
      if (visited) {
        if (content[i][j] === 0) {
          finalString += ' . ';
        } else if (content[i][j] === -1) {
          finalString += ' * ';
        } else {
          finalString += ` ${content[i][j]} `;
        }
      } else {
        finalString += ' H ';
      }
    });
    finalString += '\n';
  });

  return finalString;
}

function revealBombs(board: Board) {
  const revealedBoard = board;

  revealedBoard.content.forEach((row, i) => {
    row.forEach((val, j) => {
      if (val === -1) {
        revealedBoard.visited[i][j] = true;
      }
    });
  });
  return revealedBoard;
}

const printBoard = (board: Board) => {
  let finalBoard = board;
  if (finalBoard.state === BoardState.LOST) {
    finalBoard = revealBombs(finalBoard);
  }
  writeToStandardOutput(getPrintableBoard(finalBoard));
};

export default printBoard;
