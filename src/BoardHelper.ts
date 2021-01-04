export function coordinatesInBoard(x: number, y: number, boardContent: number[][]) {
  return x >= 0 && y >= 0 && x < boardContent.length && y < boardContent[x].length;
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

export function getDirections(): number[][] {
  return [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]];
}