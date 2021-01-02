export function coordinatesInBoard(x: number, y: number, board: number[][]) {
  return x >= 0 && y >= 0 && x < board.length && y < board[x].length;
}

export function createMatrix(size: number, func: Function) {
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
