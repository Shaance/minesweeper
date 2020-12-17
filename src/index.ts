import factory from './ConfigLog4j';

const logger = factory.getLogger('main');

export function main() {
  logger.info('Hello world!');
}

// main();
