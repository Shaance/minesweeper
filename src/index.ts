import yargs from 'yargs';
import Board from './Board';
import { play } from './BoardManager';
// import factory from './ConfigLog4j';
// import { readlineSync, writeToStandardOutput } from './StandardIOHelper';

// const logger = factory.getLogger('main');
const defaultSize = 8;
const defaultBombNumbers = 8;

export default async function main() {
  // always correct input
  const { argv } = yargs
    .option('size', {
      alias: 's',
      description: 'Specificy the size of the board (size x size). The default size of the baoard is 8x8.',
      type: 'string',
    })
    .option('bomb', {
      alias: 'b',
      description: 'Specificy the number of bombs on the board. The default number of bombs is 8.',
      type: 'string',
    })
    .help()
    .alias('help', 'h');

  const finalSize = argv.size ? parseInt(argv.size, 10) : defaultSize;
  const bombNumber = argv.bomb ? parseInt(argv.bomb, 10) : defaultBombNumbers;

  const board = new Board(finalSize, bombNumber);

  // printBoard(board);

  play(board);

  // console.log(board.content);
  // console.log(board.visited);

  // writeToStandardOutput('Col');
  // const col = await readlineSync();
  // logger.info(col);
}

main();
