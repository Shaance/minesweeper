import Board from './Board';

process.stdin.setEncoding('utf8');

export function readlineSync(): Promise<string> {
  return new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.on('data', (data) => {
      process.stdin.pause(); // stops after one line reads
      resolve(data.toString());
    });
  });
}

export function writeToStandardOutput(message: string) {
  console.log(message);
}

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

export function printBoard(board: Board) {
  writeToStandardOutput(getPrintableBoard(board));
}
