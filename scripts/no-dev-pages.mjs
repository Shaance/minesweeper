// Fails if any file under src/ references import.meta.env.DEV — the marker every
// dev-only page/route used (?lab, ?mocks, comparison pages). Such pages must be
// built outside the repo, never committed. Contract: see AGENTS.md.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const exts = new Set(['.ts', '.svelte', '.js', '.mjs']);
const offenders = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path);
    else if (exts.has(path.slice(path.lastIndexOf('.')))) {
      if (readFileSync(path, 'utf8').includes('import.meta.env.DEV')) offenders.push(path);
    }
  }
}

walk('src');

if (offenders.length > 0) {
  console.error('Dev-only code is not allowed in src/ (see AGENTS.md). Build demo/comparison pages outside the repo:');
  for (const file of offenders) console.error('  ' + file);
  process.exit(1);
}
