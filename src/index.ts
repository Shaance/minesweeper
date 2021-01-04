import yargs from 'yargs';
import { createBoard, play } from './BoardManager';
import isNumber from './CommonHelper';
import { writeToStandardOutput } from './StandardIOHelper';
// import factory from './ConfigLog4j';

// const logger = factory.getLogger('main');
const defaultSize = 8;
const defaultBombNumbers = 8;

export default async function main() {
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

  const finalSize = argv.size && isNumber(argv.size)
    ? parseInt(argv.size, 10)
    : defaultSize;
  const bombNumber = argv.bomb && isNumber(argv.bomb)
    ? parseInt(argv.bomb, 10)
    : defaultBombNumbers;
  const board = createBoard(finalSize, bombNumber);
  const gameResult = await play(board);
  writeToStandardOutput(`You ${gameResult.toString()}!`);
}

main();
