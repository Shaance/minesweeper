import type Board from './Board';
import { coordinatesInBoard } from './BoardHelper';
import BoardState from './BoardState';
import CellType from './CellType';
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
  const { content, flagged } = board;

  let finalString = getPrintableFirstRow(content[0].length);

  visitedMatrix.forEach((row: boolean[], i: number) => {
    finalString += ` ${i + 1} `;
    row.forEach((visited: boolean, j: number) => {
      finalString += getSymbolForCoordinates(visited, content, flagged, i, j);
    });
    finalString += '\n';
  });

  return finalString;
}

function getSymbolForCoordinates(visited: boolean, content: number[][], flagged: boolean[][], row: number, col: number): string {
  if (!coordinatesInBoard(row, col, content)) {
    return '';
  }

  if (flagged[row][col]) {
    return ' F ';
  }

  if (!visited) {
    return ' H ';
  }

  if (content[row][col] === CellType.EMPTY) {
    return ' . ';
  }

  if (content[row][col] === CellType.BOMB) {
    return ' * ';
  }
  return ` ${content[row][col]} `;
}

function revealBombs(board: Board) {
  const revealedBoard = board;

  revealedBoard.content.forEach((row, i) => {
    row.forEach((val, j) => {
      if (val === CellType.BOMB) {
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
