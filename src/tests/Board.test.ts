import Board from '../minesweeper/Board';
import {
  coordinatesInBoard, DEFAULT_BOMBS_NUMBER, DEFAULT_SIZE, getDirectionsWithDiagonals,
} from '../minesweeper/BoardHelper';
import BoardState from '../minesweeper/BoardState';
import CellType from '../minesweeper/CellType';
import Level from '../minesweeper/Level';

describe('Board constructor', () => {
  it('board instance should have default size when size is inferior or equal to 0', () => {
    const board = new Board(0, 0, Level.CUSTOM);
    expect(board.size).toEqual(DEFAULT_SIZE);
  });

  it('board instance should have default bombs number when bombs number is inferior or equal to 0', () => {
    const board = new Board(0, -1, Level.CUSTOM);
    const actualBombsNumber = getActualBombsNumberFromBoard(board);
    expect(actualBombsNumber).toEqual(DEFAULT_BOMBS_NUMBER);
  });

  it('board instance should have the right size', () => {
    const size = 5;
    const board = new Board(5, -1, Level.CUSTOM);
    expect(board.size).toEqual(size);
  });

  it('board instance should have correct remainingNotVisited cells', () => {
    const size = 6;
    const bombsNumber = 5;
    const board = new Board(size, bombsNumber, Level.CUSTOM);
    const expectedRemainingNotVisited = 31;
    expect(board.remainingNotVisited).toEqual(expectedRemainingNotVisited);
  });

  it('board instance should have flagsAvailables property equal to the number of bombs', () => {
    const size = 6;
    const bombsNumber = 5;
    const board = new Board(size, bombsNumber, Level.CUSTOM);
    expect(board.availableFlags).toEqual(bombsNumber);
  });

  it('board instance state should be INITIAL', () => {
    const board = new Board(5, 5, Level.CUSTOM);
    const expectedState = BoardState.INITIAL;
    expect(board.state).toEqual(expectedState);
  });

  it('board instance visited matrix should be all false', () => {
    const board = new Board(5, 5, Level.CUSTOM);
    expectValueFromMatrix(false, board.visited);
  });

  it('board instance flagged matrix should be all false', () => {
    const board = new Board(5, 5, Level.CUSTOM);
    expectValueFromMatrix(false, board.flagged);
  });

  it('board instance content should have correct adjacent cells count', () => {
    const board = new Board(5, 5, Level.CUSTOM);
    expectAdjacentCellsToHaveRightValue(board);
  });
});

function expectAdjacentCellsToHaveRightValue(board: Board) {
  const { content } = board;
  const stack = getNonBombCellsCoordinates(board);

  const directions = getDirectionsWithDiagonals();
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
