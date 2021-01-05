import Board from '../Board';
import { coordinatesInBoard, getDirections } from '../BoardHelper';
import BoardState from '../BoardState';
import CellType from '../CellType';

describe('Board constructor', () => {
  it('board instance should have default 8 size when not specified', () => {
    const board = new Board();
    const defaultSize = 8;
    expect(board.size).toEqual(defaultSize);
  });

  it('board instance should have default 8 size when size is inferior or equal to 0', () => {
    const board = new Board(0);
    const defaultSize = 8;
    expect(board.size).toEqual(defaultSize);
  });

  it('board instance should have default 8 bombs when bombs number is inferior or equal to 0', () => {
    const board = new Board(undefined, -1);
    const expectedBombNumber = 8;
    const actualBombsNumber = getActualBombsNumberFromBoard(board);
    expect(actualBombsNumber).toEqual(expectedBombNumber);
  });

  it('board instance should have default 8 bombs when not specified', () => {
    const board = new Board();
    const expectedBombNumber = 8;
    const actualBombsNumber = getActualBombsNumberFromBoard(board);
    expect(actualBombsNumber).toEqual(expectedBombNumber);
  });

  it('board instance should have the right size', () => {
    const size = 5;
    const board = new Board(size);
    expect(board.size).toEqual(size);
  });

  it('board instance should have correct remainingNotVisited cells', () => {
    const size = 6;
    const bombsNumber = 5;
    const board = new Board(size, bombsNumber);
    const expectedRemainingNotVisited = 31;
    expect(board.remainingNotVisited).toEqual(expectedRemainingNotVisited);
  });

  it('board instance state should be PLAYING', () => {
    const board = new Board();
    const expectedState = BoardState.PLAYING;
    expect(board.state).toEqual(expectedState);
  });

  it('board instance visited matrix should be all false', () => {
    const board = new Board();
    expectValueFromMatrix(false, board.visited);
  });

  it('board instance flagged matrix should be all false', () => {
    const board = new Board();
    expectValueFromMatrix(false, board.flagged);
  });

  it('board instance content should have correct adjacent cells count', () => {
    const board = new Board();
    expectAdjacentCellsToHaveRightValue(board);
  });
});

function expectAdjacentCellsToHaveRightValue(board: Board) {
  const { content } = board;
  const stack = getNonBombCellsCoordinates(board);

  const directions = getDirections();
  while (stack.length > 0) {
    const [x, y] = stack.pop();
    let adjacentCellsSum = 0;
    directions.forEach((dir) => {
      const [xi, yi] = [x + dir[0], y + dir[1]];
      if (coordinatesInBoard(xi, yi, content) && content[xi][yi] === CellType.BOMB) {
        adjacentCellsSum += 1;
      }
    });
    expect(adjacentCellsSum).toEqual(content[x][y]);
  }
}

function getNonBombCellsCoordinates(board: Board) {
  const cells = [];
  board.content.forEach((row, i) => {
    row.forEach((value, j) => {
      if (value !== CellType.BOMB) {
        cells.push([i, j]);
      }
    });
  });
  return cells;
}

function expectValueFromMatrix(expectedValue: any, matrix: any[][]) {
  matrix.forEach((row) => {
    row.forEach((value) => {
      expect(value).toEqual(expectedValue);
    });
  });
}

function getActualBombsNumberFromBoard(board: Board): number {
  const { content } = board;
  let actualBombsNumber = 0;

  content.forEach((row) => {
    row.forEach((cell) => {
      if (cell === CellType.BOMB) {
        actualBombsNumber += 1;
      }
    });
  });
  return actualBombsNumber;
}
