process.stdin.setEncoding('utf8');

export function readlineSync(): Promise<string> {
  return new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.on('data', (data) => {
      process.stdin.pause(); // stops after one line reads
      resolve(data.toString().replace(/\n/g, ''));
    });
  });
}

export function writeToStandardOutput(message: string) {
  // eslint-disable-next-line no-console
  console.log(message);
}
